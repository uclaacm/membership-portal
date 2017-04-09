const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: 'main.js',
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'build/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {loader: "css-loader", options: {minimize: true}},
            {loader: "sass-loader"},
          ]
        }),
      },
      {
        test: /\.js$/,
        use: [{loader: "babel-loader"}],
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  plugins: [
    new ExtractTextPlugin('build/[name].css'),
  ],
  watchOptions: {
    aggregateTimeout: 500,
    poll: 2000,
    ignored: /node_modules/,
  },
  devServer: {
    contentBase: [path.join(__dirname, 'pages')],
    compress: true,
    historyApiFallback: true,
    port: 8000,
  },
};
