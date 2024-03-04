const path = require('path');
const webpack = require('webpack');

const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');  // 文件体积监控，分析打包体积
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 优化和压缩css资源
const TerserPlugin = require('terser-webpack-plugin'); // 优化和压缩js资源
// 提取css成单独的文件，然后去除无用的css并进行压缩
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');


const glob = require('glob');
const PATHS = {
  src: path.resolve(__dirname, 'src')
}

module.exports = {
  mode:'production',
  entry:{
    main: './src/index.js'
  },
  output: {
      path: path.resolve(__dirname,'dist'),
      filename: '[name].js'
  },
  resolve: {
     // 编译时间优化 一：缩小查找范围，不需要再require和import的时候加扩展名
    extensions:['.js','.jsx','.json'],
    // 1.2 取别名
    alias: {
      "@": path.resolve(__dirname,'src')
    }
  },
  resolveLoader: {
    alias: {
      'uppercase-loader': path.resolve(__dirname, 'loader/uppercase-loader.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname,'src'),
        exclude: /node_modules/,
        use: [
          {
            loader:'babel-loader',
            options: {
              cacheDirectory: true, // 有缓存的启用babel缓存，重新打包的时候会尝试读取缓存
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['cache-loader', MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['cache-loader',MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
      },
      // 自定义loader
      {
        test: /\.txt$/,
        use: ['uppercase-loader']
      }
    ]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled', // 不启动展示打包报告的服务
      generateStatsFile: true, // 生成stats.js文件
    }),
    new HtmlWebpackPlugin({
      template:'./src/index.html',
      // 压缩html
      minify: {
        collapseWhitespace: true, // 去除空格
        removeComments: true, // 去除注释
      }
    }),
    // 打包体积优化：打包忽略正则匹配的文件 
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    // 压缩css
    new OptimizeCssAssetsWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    // 净化src文件下的所有文件
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, {nodir: true})
    }),
    // 设置全局变量（编译阶段使用的全局变量，浏览器运行只是值），所有模块都能访问得到
    new webpack.DefinePlugin({
      "ENVIROMENT": JSON.stringify('production')
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'], // 指定哪些文件类型应该被ESLint处理
      exclude: ['node_modules'],
    })
  ],
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      minSize: 5120000,
      maxSize: 10240000,
      cacheGroups: {
        styles: {
          name: 'styles',
          test: (m) => m.constructor.name === 'CssModule',
          chunks: 'all',
          minChunks: 1,
          enforce: true,
        },
      },
    },
    minimizer: [
      new TerserPlugin()
    ],
    usedExports: true, // 仅导出有用模块
  }
}