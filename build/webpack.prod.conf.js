var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')

var ExtractTextPlugin = require('extract-text-webpack-plugin')
//var WebpackAssetsManifest = require('webpack-assets-manifest')

var ManifestPlugin = require('webpack-manifest-plugin');

var config = require('./webpack.base.conf')

extractSASS = new ExtractTextPlugin('css/[name]-[contenthash].css')

var webpackConfig = merge(config, {
  output: {
    filename: 'js/[name]-[hash].js'
  },
  plugins: [
    extractSASS,
    /*new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: { warnings: false }
    }),*/
    new webpack.optimize.OccurenceOrderPlugin(),
    new ManifestPlugin({
      fileName: 'manifest.json'
    })
  ]
})

// On modifier le loader CSS
var css = [0, 1]
for(k in css){
  var cssLoaders = config.module.loaders[k].loaders
  webpackConfig.module.loaders[k].loaders = null
  webpackConfig.module.loaders[k].loader = extractSASS.extract(cssLoaders.slice(1, 10))
}

module.exports = webpackConfig;
