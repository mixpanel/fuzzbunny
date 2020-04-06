module.exports = {
  devtool: `sourcemap`,
  entry: `${__dirname}/index.ts`,
  mode: process.NODE_ENV || `development`,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: `ts-loader`,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [`.tsx`, `.ts`, `.js`],
  },
  output: {
    filename: `bundle.js`,
    path: __dirname,
  },
};
