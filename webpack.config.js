const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

let debug = true;
let mode = 'development';

console.log(__dirname);

module.exports = ( env, options )=>
{
	return {
		entry: [`${__dirname}/src/main.js`, `${__dirname}/src/css/main.css`],
		output: {
			path: path.resolve(__dirname, './dist'),
			filename: 'index_bundle.js',
			chunkFilename: '[id].js',
			publicPath: './dist'
		},
		module:{
			rules: [
				{
					test: /.\js$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets:['@babel/preset-env']
							}
						}
					]
				},
				{
					test: /\.html$/,
					use: ['html-loader'] 
				},
				{
					test: /\.(jpg|png)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: '/assets/img/'
							}
						}
					]
				},
				{
					test: /\.(sa|sc|c)ss$/,
					use: [{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: './dist'
						}
					}, 'css-loader', 'sass-loader']
				},
				{
					test: /\.svg$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: '/assets/svg/'
							}
						}
					]
				},
				{
					test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: (file)=> {
									return '[name].[ext]';
								},
								outputPath: '/assets/fonts/',
								publicPath: 'assets'
							}
						}
					]
				}
			]
		},
		plugins:[
			new MiniCssExtractPlugin({filename: debug ? 'css/main.css' : 'css/styles-[contenthash].css', chunkFilename: 'css/[id].css'}),

			new HtmlWebpackPlugin({
				hash: true,
				title: 'Social Baboons',
				meta: {
					description: 'Social Baboons',
					viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
					charset: 'utf-8',
					title: 'Social Baboons',
				},
				template: './src/index.html',
				filename: 'index.html',
				inject: 'body'
			}),
			new BrowserSyncPlugin({
				// browse to http://localhost:3000/ during development,
				// ./public directory is being served
				host: 'localhost',
				port: 3000,
				server: { baseDir: ['dist'] }
			})
		],
		mode: options.mode ? 'development' : 'production',
		output: {
			clean: true
		},
		// resolve: {
		// 	extensions: ['.js', '.css']
		// },
		optimization: {
			minimize: debug ? false : true
		}
	}
}