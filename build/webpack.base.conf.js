var path = require('path')
var autoprefixer = require('autoprefixer')
var mqpacker = require("css-mqpacker")

var config = require('./config')

var root = path.resolve(__dirname, '../')

module.exports = {
  entry: config.entry,
  output: config.output,
  resolve: {
    extensions: ['', '.js', '.vue', '.coffee', '.css', '.scss'],
    fallback: [path.join(__dirname, '../node_modules')]
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /(node_modules|libs)/
      }
    ],
    loaders: [
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'postcss', 'sass']
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css', 'postcss']
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: root,
        exclude: /node_modules|libs/
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
  plugins: [],
  eslint: {
    configFile: path.resolve(root, './.eslintrc'),
    formatter: require('eslint-friendly-formatter')
  },
  postcss: function () {
      return [autoprefixer({browsers: config.support}), mqpacker()];
  }
}
