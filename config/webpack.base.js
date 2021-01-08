const webpack = require('webpack');
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const bundleConfig = require("./bundle-config.json");
const manifest = require('../vendor-manifest.json');
//拆分三方库并将其注入到html中
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const os = require('os');
//开启线程
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

function resolve(dirname) {
  console.log(path.resolve(__dirname,  dirname));
  return path.resolve(__dirname,  dirname);
}
const isDevMode = process.env.NODE_ENV === 'development' ? true : false;
module.exports = {
  mode: isDevMode ? 'development' : 'production',
  entry: {
    'pve': ['babel-polyfill', resolve('../src/main.js')]
  },
  output: {
    publicPath: isDevMode ? '/public/' : '/',
    path: path.resolve(__dirname,'../public/dist'),
    filename: isDevMode ? 'js/[name].[hash:16].js' : 'mhflex/js/[name].[contenthash].js',
    chunkFilename: isDevMode ? 'js/[name].[hash:16].js' : 'mhflex/js/[name].[contenthash].js',
  },
  module: {
    unknownContextCritical: false,
    rules: [{
      test: /\.(js)$/,
      loader: 'happypack/loader?id=happyBabel',
    },{
      test: /\.(vue)$/,
        //'happypack/loader?id=happyVue',
      loader: "vue-loader"
    },{
      test: /\.(c|le)ss$/,
      use: [
        'vue-style-loader',
        !isDevMode ? 'style-loader': MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2, // 之前有2个loaders
            //modules: true, // 启用cssModules
            sourceMap: isDevMode ? true : false
          }
        },
        {
          loader: 'postcss-loader'
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
          }
        }
      ]
    },{
      test: /\.(png|jpg|svg|jpeg|gif)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            name: 'images/[name].[hash:4].[ext]',
            esModule: false,
          }
        }
      ]
    },{
      test: /\.(woff|eot|ttf|woff2)$/,
      loader: 'url-loader',
      options: {
        limit: 8192,
        name: isDevMode ? 'font/[name].[hash:4].[ext]' : 'mhflex/font/[name].[hash:4].[ext]',
        esModule: false
      }
    }]
  },
  resolve: {
    extensions: ['.js', '.vue', '.less', '.css'],
    alias: {
      "@view": resolve("../src/views/"),
      "@images": resolve("../src/assets/"),
      "@libs": resolve("../src/libs/"),
      "@src": resolve("../src/"),
      "vue$": 'vue/dist/vue.esm.js',
      "@static": resolve('../public/')
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: isDevMode ? 'css/[name].[hash:16].css' : '/mhflex/css/[name].[hash:16].css'
    }),
    new HappyPack({
      id: 'happyBabel',
      loaders: [{
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: /node_modules\/ace-builds\/.*/,
        options: {
          // babelrc: true,
          cacheDirectory: true, // 启用缓存
        }
      }],
      //代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: false,
    }),
    new HappyPack({
      id: 'happyVue',
      loaders: [{
        loader: 'vue-loader',
        options: {
          // babelrc: true,
          //cacheDirectory: true // 启用缓存
        }
      }],
      //代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: false,
    }),
    new HappyPack({
      id: 'happyStyle',
      loaders: [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2, // 之前有2个loaders
            //modules: true, // 启用cssModules
            sourceMap: isDevMode ? true : false
          }
        },
        {
          loader: 'postcss-loader',
          exclude: /node_modules/
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
          }
        }
      ],
      //代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: false,
    }),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname),
      manifest
    }),
    new HtmlWebpackPlugin({
      template: resolve("../public/index.html"),
      filename: "index.html",
      minify: false,
      inject: true,
      excludeChunks: [resolve('../node_modules')]
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, '../public/dist/static/dll.vendor_*.js'),
    })
  ]
}
