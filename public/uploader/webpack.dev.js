const path = require("path");
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");

module.exports = merge(commonConfig, {
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
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
    ]
  },
  devServer: {
    openPage: "index.html",
    contentBase: "./dist",
    compress: true,
    // host: '0.0.0.0',
    port: 33333, //process.env.PORT
    open: true,
    hot: true,
  },
});
