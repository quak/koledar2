// Require Laravel Mix
let mix = require('laravel-mix');

// Process our app.js file and output it to /dist/app.js
mix.js('src/app.js', 'dist/app.js').setPublicPath('dist');

// Setup HTML-Loader to allow us to import HTML templates
mix.webpackConfig({
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  }
});