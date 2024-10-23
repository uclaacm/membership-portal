const os = require('os');
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: 'main.js',
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    publicPath: '/',
    filename: 'build/[name].[chunkhash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                indentedSyntax: false,
              },
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: [
          'cache-loader',
          {
            loader: 'thread-loader',
            options: {
              workers: os.cpus().length - 1,
            },
          },
          'source-map-loader',
          'babel-loader',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/fonts',
            },
          },
        ],
      }
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx'],
    alias: {
      'chart.js': 'chart.js/dist/Chart.min.js',
      dexie: 'dexie/dist/dexie.min.js',
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 5,
          compress: {
            drop_console: true,
          },
          mangle: {
            toplevel: true,
          },
        },
      }),
    ],
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        WEBPACK: JSON.stringify(process.env.WEBPACK || ''),
        GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID || ''),
      },
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: '../pages/index.html',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        preserveLineBreaks: true,
      },
    }),
    new ScriptExtHtmlWebpackPlugin({
      defer: ['main', 'manifest', 'vendor'],
    }),
    new MiniCssExtractPlugin({
      filename: 'build/[name].[chunkhash:8].css',
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|eot|ttf|woff|woff2|svg)$/,
      threshold: 10240,
      minRatio: 1.0,
    }),
  ],
  watchOptions: {
    aggregateTimeout: 500,
    poll: 1000,
    ignored: /node_modules/,
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'pages'),
    },
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 8000,
  },
};
