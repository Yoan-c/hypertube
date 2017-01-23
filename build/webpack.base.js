const path = require('path')
const autoprefixer = require('autoprefixer')
const mqpacker = require("css-mqpacker")

const config = require('./config')

var root = path.resolve(__dirname, '../')

module.exports = {
  entry: config.entry,
  output: {
    path: config.asset_path,
    filename: 'js/[name].js',
    publicPath: config.asset_url
  },
  resolve: {
    extensions: ['', '.js', '.vue', '.css', '.scss'],
    fallback: [path.join(__dirname, '../node_modules')],
    alias: {
      components: path.join(__dirname, '../src/components'),
      vue: 'vue/dist/vue.js'
    }
  },
  module: {
    /*preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /(node_modules|libs)/
      }
    ],*/
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: root,
        exclude: /node_modules|libs/
      },
      {
        test: /\.scss$/,
        vue: 'scss',
        loaders: ['css', 'postcss', 'sass']
      },
      {
        test: /\.css$/,
        vue: 'css',
        loaders: ['css', 'postcss']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: 'img/[name]-[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: 'fonts/[name]-[hash:7].[ext]'
        }
      }
    ]
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  vue: {
    loaders: {}
  },
  postcss: function () {
      return [autoprefixer({browsers: config.support}), mqpacker()];
  },
  plugins: []
}
