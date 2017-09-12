## Getting Started

###### Run the following commands from the theme directory

###### Install npm dependencies with
`npm install`

_This command looks at `package.json` and installs all the npm dependencies specified in it.  Some of the dependencies include gulp, autoprefixer, gulp-sass and others._


###### Compiles Sass
`gulp watch`

###### Generate Style Guide
`gulp styleguide`


###### Developer Workflow
`cd` to _/web/themes/core__theme_ this will be where you run all your `npm` commands from. Use `gulp watch` to auto recompile js, scss, or twig files and `gulp styleguide` to generate the styleguide.

For new components you need to create the scss file under scss/ folder and call that file into your style.scss file. After creating new file then run `gulp styleguide` into your _/core__theme_ folder.
