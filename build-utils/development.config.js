const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => ({
  devtool: 'eval-cheap-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    noInfo: true,
    quiet: true,
    port: 8080,
    clientLogLevel: 'warning',
    compress: true,
    stats: 'errors-only',
    open: true,
  },
});
