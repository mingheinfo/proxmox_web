const baseWebpack = require('./webpack.base');
const {merge} = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin  } = require('clean-webpack-plugin');
const UglifyJsPlugin=require('uglifyjs-webpack-plugin');

module.exports = merge(baseWebpack, {
  devtool: "source-map",
  mode: 'production',
  optimization:{
    minimize: false,
    minimizer:[
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false
          },
          compress: {
            warnings: false,
            drop_debugger: true,
            drop_console: true
          }
        }
      })
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../public/index.html'),
      template: path.resolve(__dirname, '../public/index.html'),
      inject: 'body',
      chunks: ['manifest', 'vendor', 'app'],
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 10,
      minChunkSize: 1000
  }),
    new webpack.optimize.SplitChunksPlugin({
      chunks: "async", // 必须三选一： “initial” | “all”(默认就是all) | “async”
      minSize: 0, // 最小尺寸，默认0
      minChunks: 1, // 最小 chunk ，默认1
      maxAsyncRequests: 1, // 最大异步请求数， 默认1
      maxInitialRequests: 1, // 最大初始化请求书，默认1
      maxChunks: 10,
      name: function (name) {
        console.log('==========' + name);
        return name
      }, // 名称，此选项可接收 function
      cacheGroups: { // 这里开始设置缓存的 chunks
        priority: 0, // 缓存组优先级
        vendor: { // key 为entry中定义的 入口名称
          chunks: "async", // 必须三选一： “initial” | “all” | “async”(默认就是异步)
          name: "vendor", // 要缓存的 分隔出来的 chunk 名称
          minSize: 0,
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
