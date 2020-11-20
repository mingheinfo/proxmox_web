
const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge');
const webpackConfigBase = require('./webpack.base')
const { CleanWebpackPlugin }  = require('clean-webpack-plugin');
const UglifyJsPlugin=require('uglifyjs-webpack-plugin');
const os = require('os');
let selfIp;
try {
  selfIp = os.networkInterfaces()['WLAN'][1].address;
} catch (e) {
  selfIp = 'localhost'
}

const PORT = 3333
function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}
const webpackConfigDev = {
  mode: 'development',
  plugins: [
    // 定义环境变量为开发环境
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      IS_DEVELOPMETN: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
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
  devtool: 'source-map',
  devServer: {
    contentBase: resolve('/public/dist'),
    historyApiFallback: {
      rewrites: [
        { from: /^\/*/, to: '/public/index.html' }
      ]
    },
    open: true,
    hot: true,
    host: selfIp,
    port: PORT,
    proxy: {
      '/api2/*': {//代理请求前缀
        target: 'https://10.10.10.220:8006/',//代理服务端路径
        secure: false,
        changeOrigin:true,
        ws: true
        //changeOrigin: true,
        //pathRewrite: {'^/api' : ''}//请求到服务端后是否重写路径
      },
      '/shell/*': {//代理请求前缀
        target: 'https://10.10.10.220:8006/',//代理服务端路径
        secure: false,
        changeOrigin: true,
        pathRewrite: {'/shell/' : '/'}//请求到服务端后是否重写路径
      },
      '/xtermjs/*': {
        target: 'https://10.10.10.220:8006/',//代理服务端路径
        secure: false,
        changeOrigin: true,
        ws: true
      },
      '/novnc/*': {
        target: 'https://10.10.10.220:8006/',//代理服务端路径
        secure: false,
        changeOrigin: true
      },
      '/vncwebsocket': {
        target: 'wss://10.10.10.220:8006/',//代理服务端路径
        secure: false,
        ws: true,
        pathRewrite: {'wss://localhost:3333/' : 'wss://10.10.10.220:8006/'},
        changeOrigin: true
      }
    }
  },
}

module.exports = merge(webpackConfigBase, webpackConfigDev);
