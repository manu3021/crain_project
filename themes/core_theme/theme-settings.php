<?php

/**
 * @file
 * This is the heart of creating custom theme settings. You set all of your form options within
 * the form_system_theme_settings_alter hook. From the Drupal API:
 * "With this hook, themes can alter the theme-specific settings form in any way allowable by
 * Drupal's Form API, such as adding form elements, changing default values and removing form
 * elements. See the Form API documentation on api.drupal.org for detailed information."
 * (https://api.drupal.org/api/drupal/core!lib!Drupal!Core!Render!theme.api.php/function/
 * hook_form_system_theme_settings_alter/8)
 *
 */

/**
 * Implementation of hook_form_system_theme_settings_alter()
 *
 * @param $form
 *   Nested array of form elements that comprise the form.
 *
 * @param $form_state
 *   A keyed array containing the current state of the form.
 */
function core_theme_form_system_theme_settings_alter(&$form, &$form_state, &$name) {
  // Set up a fieldset for the site's "flavor"
  $name =  \Drupal::theme()->getActiveTheme()->getName();
  $form['site_flavor_settings'] = array(
    '#type'         => 'details',
    '#markup'       => '<a href="../../../themes/' . $name . '/styleguide" >Styleguide</a>',
    '#title'        => t('styleguide'),
    '#weight' => -1000,
    '#open' => TRUE,
  );
}
