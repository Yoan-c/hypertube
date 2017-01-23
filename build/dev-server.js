const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const config = require('./config')
const webpack_config = require('./webpack.dev')

const chokidar = require('chokidar')

const compiler = webpack(webpack_config)
const hotMiddleware = require("webpack-hot-middleware")(compiler);

var refresh = function (event, path) {
  console.log('* ' + path + ' changed')
  hotMiddleware.publish({action: 'reload'})
}

var server = new WebpackDevServer(compiler, {
  contentBase: './src',
  hot: true,
  historyApiFallback: true,
  quiet: false,
  noInfo: false,
  publicPath: webpack_config.output.publicPath,
  watchOptions: {
    ignored: /node_module/
  },
  stats: {
    chunks: false,
    colors: true
  }
})

// On utilise le hot-middleware
server.use(hotMiddleware);

// On écoute sur le port demandé depuis la configuration
server.listen(config.port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  chokidar.watch(config.forceReload).on('change', refresh).on('add', refresh)
  console.log('Listening at http://localhost:' + config.port + '\n')
})
