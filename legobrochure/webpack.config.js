const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/js/index.js',
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
      filename: 'bundle.js',
      path: __dirname,
    },
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [
                    'style-loader',
                    {
                        loader: "css-loader",
                        options: {
                          modules: true,
                        },
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', "@babel/preset-react"]
                    }
                },
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Lego Brochure',
        }),
    ],
}