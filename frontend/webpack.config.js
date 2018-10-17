const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
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
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "cache-loader",
            },
            {
              loader: "css-loader",
              options: {
                minimize: true,
              },
            },
            {
              loader: "sass-loader",
            },
          ]
        }),
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: "cache-loader"
          },
          {
            loader: "thread-loader",
            options: {
              workers: require('os').cpus().length - 1,
            },
          },
          {
            loader: "source-map-loader",
          },
          {
            loader: "babel-loader",
          },
        ]
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: ['.js', '.jsx'],
    alias: {
      // use production bundles for JS libraries
      'chart.js': 'chart.js/dist/Chart.min.js',
      'dexie': 'dexie/dist/dexie.min.js',
      // 'react-facebook-login': 'react-facebook-login/dist/facebook-login-render-props',
    },
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: 2,
        uglifyOptions: {
          ecma: 5,
          compress: {
            drop_console: true,
            toplevel: true,
            unsafe_comps: true,
            unsafe_Function: true,
            unsafe_math: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
            passes: 2,
          },
          mangle: {
            toplevel: true,
          }
        }
      })
    ],
    runtimeChunk: {
      name: "manifest",
    },
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
          priority: -20,
        },
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'WEBPACK': JSON.stringify(process.env.WEBPACK || ''),
      }
    }),

    new CleanWebpackPlugin(['lib']),

    new HtmlWebpackPlugin({
      template: '../pages/index.html',
      minify: {
        collapseWhitespace: true,
        conservativeCollapse: true,
        preserveLineBreaks: true,
      },
    }),
    new ScriptExtHtmlWebpackPlugin({
      defer: /(main)|(manifest)|(vendor)/,
    }),

    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),

    // remove useless locales that moment automatically bundles
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ExtractTextPlugin('build/[name].[chunkhash:8].css'),

    // precompress files so that we don't need to gzip on the fly
    new CompressionPlugin({
      filename: '[path].gz',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
      threshold: 10240,
      minRatio: 1.0,
    }),
  ],
  watchOptions: {
    aggregateTimeout: 500,
    poll: 1000,
    ignored: /node_modules/,
  },
  devtool: "source-map",
  devServer: {
    contentBase: [path.join(__dirname, 'pages')],
    historyApiFallback: true,
    host: "0.0.0.0",
    port: 8000,
  },
};
