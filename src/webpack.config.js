const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const BomPlugin = require('webpack-utf8-bom');
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin").TsconfigPathsPlugin;

const path = require('path');
const isDevelopment = false;
const env = !isDevelopment ? 'production' : 'development';
const target = isDevelopment ? 'web' : 'browserslist';
const entryFilePath = './app/index.tsx';

const scriptExtensions = /\.(tsx|ts|js|jsx)$/;
const styleExtensions = /\.(css|less|styl|scss|sass|sss)$/;
const imageExtensions = /\.(bmp|gif|jpg|jpeg|png|webp|svg)$/;
const fontsExtension = /\.(eot|otf|ttf|woff|woff2)$/;

module.exports = (env, { mode }) => {
  console.log(mode);
  return {
    cache: true,
    mode: mode,
    target,
    entry: {
      bundle: path.resolve(__dirname, entryFilePath),
    },
    output: {
      path: path.resolve(__dirname, '..', 'dist'),
      filename: '[name].[contenthash].js',
      clean: true, // delete existing files from previous build
      assetModuleFilename: '[name].[contenthash][ext]', // for asset file name
    },
    resolve: {
      extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
        }),
      ]
    },
    optimization: {
      moduleIds: 'deterministic', // Added this to retain hash of vendor chunks
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/, // extract all node_modules code from main code
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: styleExtensions,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: scriptExtensions,
          use: {
            loader: 'babel-loader',
          },
          include: [path.resolve(__dirname, 'app')],
          exclude: /node_modules/,
        },
        {
          test: imageExtensions,
          type: 'asset/resource',
          include: path.resolve(__dirname, 'app', 'assets', 'images'),
        },
        {
          test: fontsExtension,
          type: 'asset',
          include: path.resolve(__dirname, 'app', 'assets', 'fonts'),
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'test',
        filename: 'index.html',
        template: path.resolve(__dirname, 'public', 'index.html'),
        jsExtension: '.br'
      }),
      new MiniCssExtractPlugin(),
      // new BomPlugin(true),
      ...(!isDevelopment ? [new CompressionPlugin({
        algorithm: 'brotliCompress',
      })] : []),
      new BundleAnalyzerPlugin({
        analyzerMode: isDevelopment ? 'server' : 'disabled',
        openAnalyzer: true,
        generateStatsFile: true,
        analyzerPort: 'auto'
      }),
    ],
    devtool: isDevelopment ? 'source-map' : false,
    devServer: isDevelopment
      ? {
        host: 'localhost',
        port: 3000,
        open: true, // open browser, paste string for specific route
        static: {
          directory: path.resolve(__dirname, '..', 'dist'),
        },
        hot: true,
        compress: true, // enable gzip compression
        historyApiFallback: true,
      }
      : {},
  }
};
