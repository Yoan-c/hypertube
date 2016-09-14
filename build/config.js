const path = require('path')

module.exports = {
  entry: {
    app: ['./src/css/app.scss', './src/js/app.js']
  },

  asset_path: path.resolve(__dirname, '../dist/assets'),
  asset_url: '/assets/',

  port: 3002,
  base: './src',
  support: ['last 2 versions', 'ie > 8'], // Pour autoprefixer
  forceReload: ['./src/index.html']
}
