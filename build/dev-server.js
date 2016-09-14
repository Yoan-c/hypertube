const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const config = require('./config')
const webpack_config = require('./webpack.dev')

const chokidar = require('chokidar')

const compiler = webpack(webpack_config)
const hotMiddleware = require("webpack-hot-middleware")(compiler);

// Dès qu'un fichier est modifié on force le reload complet de la page
var refresh = function (event, path) {
  console.log('* ' + path + ' changed')
  hotMiddleware.publish({action: 'reload'})
}

// Les options de base de notre dev-server
var serverOptions = {
  contentBase: config.base,
  hot: true,
  historyApiFallback: false,
  quiet: false,
  noInfo: false,
  publicPath: webpack_config.output.publicPath,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 50
  },
  stats: {colors: true}
}

var server = new WebpackDevServer(compiler, serverOptions)

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
