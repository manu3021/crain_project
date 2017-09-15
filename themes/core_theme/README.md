## Getting Started
If you haven't yet, install nvm:
https://github.com/creationix/nvm

### Stylegudie
To see the styleguide . you need to go in apperance and then click on setting where styleguide link appear click on it.

### Run the following commands from the theme directory

#### Use the right version of node with:
`nvm use`

_This command will look at your `.nvmrc` file and use the version node.js specified in it. This ensures all developers use the same version of node for consistency._

#### If that version of node isn't installed, install it with:
`nvm install`

#### Install npm dependencies with
`npm install`

_This command looks at `package.json` and installs all the npm dependencies specified in it.  Some of the dependencies include gulp, autoprefixer, gulp-sass and others._

#### Install bower globally
`npm install -g bower`  

#### Install bower dependencies with
`bower install`

_This command installs all the JavaScript libraries necessary._

#### Runs default task
`npm run build`

_This will run whatever the default task is._

#### Compiles Sass
`npm run compile`

_This will perform a one-time Sass compilation._

#### Runs the watch command
`npm run watch`

_This is ideal when you are doing a lot of Sass changes and you want to make sure every time a change is saved it automatically gets compiled to CSS_

#### Cleans complied directory
`npm run clean`

_This will perform a one-time deletion of all compiled files within the dist/ directory._

## Developer Workflow
`cd` to _/web/themes/custom/world101_theme_ this will be where you run all your `npm` commands from. Use `npm run watch` to auto recompile the style-guide when you make changes to js, scss, or twig files.
>Note: If you make a change to the KSS builder files, or add icons and do not see your changes automatically update try running `npm run clean && npm run build`

All SASS files should live under one of the folders in *src/styles*. Styles specific to a components should live under *src/styles/components* with a name that matches the component.

For the time being all .twig and .json files will live under the components folder with a directory specific to the name of the component. If you find yourself re-using markup or building full pages that aren't necessarily components there is a *src/templates* that can also be used to store .twig files.
>Note: When you add new components that require data from a json file make sure to stop your watch task and re-run it for gulp to be aware of the new json.
