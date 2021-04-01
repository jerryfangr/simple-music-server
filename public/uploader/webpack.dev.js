const path = require("path");
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");

module.exports = merge(commonConfig, {
  mode: "development",
  devtool: "eval-cheap-module-source-map", // 生产环境建议 inline-source-map, 或者去掉选项
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  // 非js模块引用
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  // 热更新
  devServer: {
    // 多个输出，配置当前调试的页面，否则为根路径http://localhost:3333/
    openPage: "index.html",
    // 项目构建目录
    contentBase: "./dist",
    // 启动gzip压缩
    compress: true,
    // host 默认只能在本机打开，这里运行外网与局域网打开
    // host: '0.0.0.0',
    // 服务端口号
    port: 33333, //process.env.PORT
    // 编译完自动打开浏览器
    open: true,
    // 热更新模块
    hot: true,
  },
});
