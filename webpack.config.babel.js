import path from 'path';
import fs from 'fs';

require('dotenv').config();
import app from './app.json';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import workboxPlugin from 'workbox-webpack-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest';
import { DefinePlugin } from 'webpack';

module.exports = (env, argv) => {
  const dirDist = path.resolve(__dirname, 'dist');
  const dirSrc = path.resolve(__dirname, 'src');
  const dev = argv.mode !== 'production';

  let serveHttps = false;
  if (process.env.SSL_KEY && process.env.SSL_CRT && process.env.SSL_PEM) {
    serveHttps = {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CRT),
      ca: fs.readFileSync(process.env.SSL_PEM),
    };
  }

  return {
    entry: {
      app: `${dirSrc}/index.ts`,
    },
    devServer: {
      contentBase: dirDist,
      compress: true,
      port: process.env.PORT || 8080,
      https: serveHttps,
      hot: true,
      historyApiFallback: true,
    },
    output: {
      path: dirDist,
      filename: 'assets/[name]-[hash].js',
      publicPath: '/',
    },
    devtool: dev ? `cheap-module-eval-source-map` : undefined,
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new MiniCssExtractPlugin({
        filename: dev ? 'assets/[name].css' : 'assets/[name].[hash].css',
        chunkFilename: dev
          ? 'assets/[name].[id].css'
          : 'assets/[name].[id].[hash].css',
      }),
      new CopyWebpackPlugin([
        {
          from: 'src/static',
          to: 'assets/static',
        },
      ]),
      new HtmlWebpackPlugin({
        title: app.title,
        description: app.description,
        template: 'src/index.html',
        filename: './index.html',
        chunksSortMode: 'none',
        minify: dev
          ? false
          : {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
            },
      }),
      ...(!dev || process.env.GENERATE_SW === 'true' // only generate manifest and SW in prod build
        ? [
            new WebpackPwaManifest({
              name: app.title,
              short_name: app.short,
              description: app.description,
              theme_color: app.color,
              background_color: app.colorbkg,
              crossorigin: 'use-credentials',
              fingerprints: false,
              icons: [
                {
                  src: path.resolve(`${dirSrc}/static/logos/app-icon.png`),
                  sizes: [96, 128, 192, 256, 384, 512],
                  destination: path.join('assets', 'pwa-icon'),
                  ios: true,
                  purpose: 'maskable',
                },
              ],
            }),
            new workboxPlugin.InjectManifest({
              swSrc: './src/service-worker.js',
              include: [/\.html$/, /\.js$/, /\.css$/],
              maximumFileSizeToCacheInBytes: 5000000,
            }),
          ]
        : []),
      new DefinePlugin({
        API_BASE: JSON.stringify(
          process.env.API_BASE || 'https://api.camp.nico.dev/'
        ),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          loader: ['babel-loader', 'raw-loader'],
        },
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(png|jpg|gif)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]',
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: dev,
                //reloadAll: true,
              },
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  require('postcss-mixins')({
                    mixinsDir: path.join(__dirname, 'src/styles/mixins'),
                  }),
                  require('postcss-nested'),
                  require('autoprefixer'),
                ],
              },
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        '@app': `${dirSrc}/app/`,
        '@comp': `${dirSrc}/app/components/`,
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  };
};
