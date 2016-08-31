const webpack = require('webpack')

const config = require('./config')
const webpack_config = require('./webpack.base')

// add hot-reload related code to entry chunks
for(var name in webpack_config.entry) {
    webpack_config.entry[name] = ['./build/dev-client'].concat(webpack_config.entry[name])
}

webpack_config.devtool = '#eval-source-map'
webpack_config.devServer = {
    headers: { "Access-Control-Allow-Origin": "*" }
}

if (config.proxy){
  webpack_config.output.publicPath = "http://localhost:" + config.port + webpack_config.output.publicPath
}

webpack_config.plugins.push(
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
)

webpack_config.module.loaders.forEach(function (loader) {
  if (loader.vue) {
    webpack_config.vue.loaders[loader.vue] = 'vue-style-loader!' + loader.loaders.join('-loader!') + '-loader'
  }
  if (loader.loaders && !loader.loaders.indexOf('css')) {
    loader.loaders = ['style', ...loader.loaders]
  }
})

module.exports = webpack_config
