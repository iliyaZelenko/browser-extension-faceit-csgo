const webpack = require('webpack')
const ejs = require('ejs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')
const { VueLoaderPlugin } = require('vue-loader')
const { version } = require('./package.json')

const config = {
  devtool: 'cheap-module-source-map',
  mode: process.env.NODE_ENV,
  context: __dirname + '/src',
  entry: {
    'background': './background.js',
    'popup/popup': './popup/popup.js',
    'options/options': './options/options.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loaders: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax']
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?emitFile=false'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new CopyWebpackPlugin([
      { from: '_locales', to: '_locales' },
      { from: 'assets', to: 'assets' },
      { from: 'icons', to: 'icons', ignore: ['icon.xcf'] },
      { from: 'popup/popup.html', to: 'popup/popup.html', transform: transformHtml },
      { from: 'options/options.html', to: 'options/options.html', transform: transformHtml },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: (content) => {
          const jsonContent = JSON.parse(content)
          jsonContent.version = version

          if (config.mode === 'development') {
            jsonContent['content_security_policy'] = {
              // unsafe-eval
              extension_pages: "script-src 'self'; object-src 'self'"
            }
          }

          return JSON.stringify(jsonContent, null, 2)
        }
      }
    ]),
    new WebpackShellPlugin({
      onBuildEnd: ['node scripts/remove-evals.js']
    })
  ]
}
if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    })
  ])
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ChromeExtensionReloader()
  ])
}

function transformHtml (content) {
  return ejs.render(content.toString(), {
    ...process.env
  })
}

module.exports = config
