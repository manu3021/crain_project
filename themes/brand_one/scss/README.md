### Brand One Theme Styleguide

`brand_one` theme is sub theme of `classy` which inherite all the features of `classy`.

[** brand_one Styleguide **](../../brand_one/pattern-lab/public)

###### Run the following commands from the theme directory

###### Install npm dependencies with
`npm install`

_This command looks at `package.json` and installs all the npm dependencies specified in it.  Some of the dependencies include gulp, autoprefixer, gulp-sass and others._


###### Compiles Sass , Genreate style guide 
`npm start`

###### Developer Workflow
`cd` to `_/web/themes/brand_one` this will be where you run all your `npm` commands from. Use `npm start` to auto recompile js, scss, or twig files and `gulp styleguide` to generate the styleguide.

For new components you need to create the scss file under scss/ folder and call that file into your style.scss file. After creating new file then run `gulp styleguide` into your `/brand_one` folder.
