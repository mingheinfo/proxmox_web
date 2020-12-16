const baseWebpack = require('./webpack.base');
const {merge} = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin  } = require('clean-webpack-plugin');
function resolve(dirname) {
  console.log(path.resolve(__dirname,  dirname));
  return path.resolve(__dirname,  dirname);
}
module.exports = merge(baseWebpack, {
  devtool: "cheap-module-source-map",
  mode: 'production',
  optimization:{
    minimize: true,
    splitChunks: {
      cacheGroups: {
            commons: {
              name: "vendor",
              chunks: "initial",
              minChunks: 2
          }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new HtmlWebpackPlugin({
      template: resolve("../public/index.html"),
      filename: "index.html",
      minify: true,
      inject: true,
      chunks: ['manifest', 'vendor', 'pve'],
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 10,
      minChunkSize: 100
  }),
    new webpack.optimize.SplitChunksPlugin({
      chunks: "async", // 必须三选一： “initial” | “all”(默认就是all) | “async”
      minSize: 1000, // 最小尺寸，默认0
      minChunks: 1, // 最小 chunk ，默认1
      maxAsyncRequests: 1, // 最大异步请求数， 默认1
      maxInitialRequests: 1, // 最大初始化请求书，默认1
      maxChunks: 10,
      name: function (name) {
        return name
      }, // 名称，此选项可接收 function
      cacheGroups: { // 这里开始设置缓存的 chunks
        priority: 0, // 缓存组优先级
        vendor: { // key 为entry中定义的 入口名称
          chunks: "async", // 必须三选一： “initial” | “all” | “async”(默认就是异步)
          name: "vendor", // 要缓存的 分隔出来的 chunk 名称
          minSize: 1000,
          minchunks: 1,
          enforce: true,
          maxChunks: 10,
          test: /node_modules/,
          maxAsyncRequests: 1, // 最大异步请求数， 默认1
          maxInitialRequests: 1, // 最大初始化请求书，默认1
          reuseExistingChunk: true // 可设置是否重用该chunk（查看源码没有发现默认值）
        }
      }
    }),
    function () {
      this.plugin("done", function (stats) {
        if (stats.compilation.errors && stats.compilation.errors.length) {
          console.log(stats.compilation.errors);
          process.exit(1);
        }
      });
    }
  ]
})
