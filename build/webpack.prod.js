const webpack = require('webpack')
const merge = require('webpack-merge')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')

const config = require('./webpack.base')

var webpack_config = merge(config, {
  output: {
    filename: 'js/[name].[chunkhash:8].js'
  },
  plugins: [
    new ProgressBarPlugin(),
    new ExtractTextPlugin('css/[name].[contenthash:8].css'),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new AssetsPlugin({
      filename: config.output.path + '/manifest.json'
    })
  ]
})

webpack_config.module.loaders.forEach(function(loader) {
    if (loader.vue) {
       webpack_config.vue.loaders[loader.vue] = ExtractTextPlugin.extract(loader.loaders)
     }

    if (loader.loaders && !loader.loaders.indexOf('css')) {
        loader.loader = ExtractTextPlugin.extract(loader.loaders)
        delete loader['loaders']
    }
})

module.exports = webpack_config;
