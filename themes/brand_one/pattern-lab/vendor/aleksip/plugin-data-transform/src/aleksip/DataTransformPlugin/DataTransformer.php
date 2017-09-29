<?php

namespace aleksip\DataTransformPlugin;

use Drupal\Core\Template\Attribute;
use Drupal\Core\Url;
use PatternLab\Data;
use PatternLab\PatternData;

class DataTransformer
{
    protected static $processed = array();

    protected $reservedKeys;
    protected $patternDataStore;
    protected $env;
    protected $hasRun;

    public function __construct()
    {
        // TODO: Add an accessor function for $reservedKeys to the Data class?
        $this->reservedKeys = array("cacheBuster","link","patternSpecific","patternLabHead","patternLabFoot");
        $this->patternDataStore = PatternData::get();
    }

    public function run(\Twig_Environment $env)
    {
        $this->env = $env;
        if ($this->hasRun) {
            return;
        }
        // Process global data.
        $dataStore = $this->processData(Data::get());
        Data::replaceStore($dataStore);
        // Process pattern specific data.
        foreach (array_keys($this->patternDataStore) as $pattern) {
            $this->processPattern($pattern);
        }
        $this->hasRun = true;
    }

    protected function isProcessed($pattern)
    {
        return isset(self::$processed[$pattern]);
    }

    protected function setProcessed($pattern)
    {
        self::$processed[$pattern] = true;
    }

    protected function processPattern($pattern)
    {
        if (
            $this->isProcessed($pattern)
            || !isset($this->patternDataStore[$pattern])
            || $this->patternDataStore[$pattern]['category'] != 'pattern'
        ) {
            return;
        }
        $this->setProcessed($pattern);
        $patternSpecificData =
            $this->processData(Data::getPatternSpecificData($pattern))
        ;
        $dataStore = Data::get();
        foreach (array_keys($patternSpecificData) as $key) {
            if (!isset($dataStore['patternSpecific'][$pattern]['data'][$key])) {
                // Value is default global data.
                if (is_object($dataStore[$key])) {
                    $patternSpecificData[$key] = clone $dataStore[$key];
                }
            }
        }
        Data::initPattern($pattern);
        Data::setPatternData($pattern, $patternSpecificData);
    }

    protected function processData($data)
    {
        foreach (array_keys($data) as $key) {
            if (!in_array($key, $this->reservedKeys)) {
                $data = $this->processKey($data, $key);
            }
        }

        return $data;
    }

    protected function processKey($data, $key)
    {
        $value = $data[$key];
        if (is_array($value)) {
            foreach (array_keys($value) as $subKey) {
                $value = $this->processKey($value, $subKey);
            }
            if (isset($value['Attribute()']) && is_array($value['Attribute()'])) {
                $data[$key] = new Attribute($value['Attribute()']);
            }
            elseif (isset($value['Url()']['url'])) {
              $options = isset($value['Url()']['options']) && is_array($value['Url()']['options']) ? $value['Url()']['options'] : [];
              $data[$key] = Url::fromUri($value['Url()']['url'], $options);
            }
            elseif (isset($value['include()']) && is_array($value['include()']) && isset($value['include()']['pattern'])) {
                $pattern = $value['include()']['pattern'];
                if (is_string($pattern) && isset($this->patternDataStore[$pattern])) {
                    if (!isset($value['include()']['with']) || !is_array($value['include()']['with'])) {
                        if (!isset($value['include()']['only'])) {
                            $patternData = $this->getProcessedPatternSpecificData($pattern);
                        }
                        else {
                            $patternData = array();
                        }
                    }
                    elseif (!isset($value['include()']['only'])) {
                        $patternData = $this->getProcessedPatternSpecificData($pattern, $value['include()']['with']);
                    }
                    else {
                        $patternData = $value['include()']['with'];
                    }
                    $data[$key] = $this->renderPattern($pattern, $patternData);
                }
            }
            elseif (isset($value['join()']) && is_array($value['join()'])) {
                $data[$key] = join($value['join()']);
            }
            else {
                $data[$key] = $value;
            }
        }
        elseif (is_string($value) && isset($this->patternDataStore[$value]) && $key !== 'pattern') {
            $data[$key] = $this->renderPattern($value, $this->getProcessedPatternSpecificData($value));
        }

        return $data;
    }

    public function getProcessedPatternSpecificData($pattern, $extraData = array())
    {
        $this->processPattern($pattern);

        return Data::getPatternSpecificData($pattern, $extraData);
    }

    protected function renderPattern($pattern, $data)
    {
        if (isset($this->patternDataStore[$pattern]['patternRaw'])) {
            foreach (array_keys($data) as $key) {
                $data = $this->cloneObjects($data, $key);
            }
            $pattern = $this->env->render(
                $this->patternDataStore[$pattern]['patternRaw'],
                $data
            );
        }

        return $pattern;
    }

    protected function cloneObjects($data, $key)
    {
        $value = $data[$key];
        if (is_array($value)) {
            foreach (array_keys($value) as $subKey) {
                $value = $this->cloneObjects($value, $subKey);
            }
            $data[$key] = $value;
        }
        elseif (is_object($value)) {
            $data[$key] = clone $value;
        }

        return $data;
    }
}
