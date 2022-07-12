const path = require("path");
const webpack = require("webpack");

const BUILD_PATH = path.resolve(__dirname, "dist");

module.exports = {
  mode: "development",
  entry: {
    index: [
      // 需要加入这一行代码，在客户端文件里注入热替换相关的代码
      // "./plugins/hot/client?path=/__webpack_hmr&noInfo=true&reload=true",
      "webpack-hot-middleware/client?path=/__webpack_hmr&noInfo=true&reload=true",
      path.resolve(__dirname, "./index.js"),
    ],
  },
  output: {
    path: BUILD_PATH,
    filename: "bundle.js", //将app文件夹中的两个js文件合并成build目录下的bundle.js文件
    publicPath: "/", //publicPath 也会在服务器脚本用到，以确保文件资源能够在 http://localhost:3000 下正确访问
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "esbuild-loader",
          },
        ],
        exclude: "/node_modules/",
      },
    ],
  },
  plugins: [
    // 我们的插件里也需要添加HotModuleReplacementPlugin这个插件
    new webpack.HotModuleReplacementPlugin(),
  ],
};
