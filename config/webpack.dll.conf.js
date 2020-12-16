const path = require('path')
const webpack = require('webpack')
const package = require('../package.json')
module.exports = {
  entry: {
    //读取package.json里的依赖，normalize.css除外，打包会报错
    //如果使用了chrome的vue-devtool，那打包的时候把vue也排除掉，因为压缩过的vue是不能使用vue-devtool的
    vendor: Object.keys(package.dependencies).filter((item) => {
      return item.indexOf('normalize') < 0 && item != 'vue'
    })
  },
  output: {
    path: path.join(__dirname, '../public/dist/static'),
    filename: 'dll.[name]_[hash:6].js',
    library: '[name]_[hash:6]'
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '../', '[name]-manifest.json'),
      name: '[name]_[hash:6]'
    })
  ]
}