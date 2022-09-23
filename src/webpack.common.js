const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BomPlugin = require('webpack-utf8-bom');
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin").TsconfigPathsPlugin;
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { DefinePlugin } = require('webpack');

const dotEnv = require('dotenv').config({ path: './.env' }).parsed;
const path = require('path');

const scriptExtensions = /\.(tsx|ts|js|jsx)$/;
const styleExtensions = /\.(css|less|styl|scss|sass|sss)$/;
const imageExtensions = /\.(bmp|gif|jpg|jpeg|png|webp|svg)$/;
const fontsExtension = /\.(eot|otf|ttf|woff|woff2)$/;
const entryFilePath = './app/index.tsx';

const publicReactEnvPrefix = "REACT_PUBLIC";
const publicReactEnv = Object.entries(dotEnv)
  .reduce((acc, current) => {
    const [key, value] = current;
    if (key.startsWith(publicReactEnvPrefix)) {
      acc[key] = value;
    }
    return acc;
  }, {})

const commonModule = (env, { mode }) => {
  const isDevelopment = mode !== 'production';
  const target = isDevelopment ? 'web' : 'browserslist';

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
      clean: true,
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
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/, // extract all node_modules code from main code
            name(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`;
            },
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
      new DefinePlugin({
        'process.env': JSON.stringify(publicReactEnv),
      }),
      new HtmlWebpackPlugin({
        title: dotEnv.REACT_PUBLIC_DEFAULT_TITLE,
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
        port: dotEnv.WEB_PORT_HTTP,
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

module.exports = {
  scriptExtensions,
  fontsExtension,
  imageExtensions,
  styleExtensions,
  commonModule,
}