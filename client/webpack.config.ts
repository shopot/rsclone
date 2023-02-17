import path from 'node:path';
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import ESLintPlugin from 'eslint-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import { NetlifyPlugin } from 'netlify-webpack-plugin';
import StylelintPlugin from 'stylelint-webpack-plugin';
import WebpackPWAManifestPlugin from 'webpack-pwa-manifest';

const devMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode: devMode,
  // watch: devMode !== 'production', no need use with serve together
  devtool: devMode === 'production' ? 'source-map' : 'eval-source-map',
  entry: {
    index: './src/index',
  },
  output: {
    clean: devMode === 'production',
    filename: '[name].[contenthash].js',
    assetModuleFilename: './assets/[name].[contenthash][ext][query]',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    open: true,
    port: 5333,
    hot: false,
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/index.html' }, // all requests to index.html
      ],
    },
    client: {
      overlay: true,
      progress: true,
    },
    liveReload: true,
    watchFiles: ['src/*.html', 'src/**/*.{ts,tsx}'],
  },
  plugins: [
    new ESLintPlugin(),
    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: path.resolve('./src/index.html'),
      chunks: ['index'],
    }),
    new WebpackPWAManifestPlugin({
      name: 'Card Game Client',
      publicPath: './',
      // @ts-expect-error "'omit' is allowed value for 'orientation', provided types are not complete"
      orientation: 'omit',
      icons: [
        {
          src: path.resolve('./src/assets/icon-192.png'),
          destination: 'assets',
          sizes: [192, 192],
        },
        {
          src: path.resolve('./src/assets/icon-512.png'),
          destination: 'assets',
          sizes: [512, 512],
        },
      ],
    }),
    new MiniCSSExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new StylelintPlugin(),
    new NetlifyPlugin({
      redirects: [
        {
          from: '/*',
          to: '/index.html',
          status: 200,
        },
      ],
    }),
    new Dotenv({
      path: `${__dirname}/.env.${devMode === 'production' ? 'production' : 'development'}`,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m\.css$/,
        use: [
          devMode === 'production' ? MiniCSSExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:5]',
              },
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.css$/,
        exclude: [/\.m\.s?css$/],
        use: [
          devMode === 'production' ? MiniCSSExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.m\.scss$/,
        use: [
          devMode === 'production' ? MiniCSSExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:5]',
              },
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.scss$/,
        exclude: [/\.m\.s?css$/],
        use: [
          devMode === 'production' ? MiniCSSExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /favicon\.ico$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        test: /\.(avif|jpe?g|png|webp)$/,
        exclude: path.resolve(__dirname, 'src/assets/phaser'),
        type: 'asset',
      },
      {
        test: /\.(avif|jpe?g|png|webp)$/,
        include: path.resolve(__dirname, 'src/assets/phaser'),
        type: 'asset/resource',
      },
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: { not: [/component/] }, // exclude react component if *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: /component/, // *.svg?component
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              prettierConfig: './.prettierrc.json',
            },
          },
        ],
      },
      {
        test: /\.(mp3|ogg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/media/[name][ext]',
        },
      },
      {
        test: /\.(eot|otf|ttf|woff2?)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '...'],
  },
  optimization: {
    minimizer: [`...`, new CSSMinimizerPlugin()],
  },
};
