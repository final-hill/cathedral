import path from 'path';
import url from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import { GenerateSW } from 'workbox-webpack-plugin';

const __filename = url.fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);

export default {
    devtool: 'source-map',
    entry: {
        main: './src/main.mts'
    },
    experiments: {
        outputModule: true
    },
    mode: 'production',
    module: {
        rules: [
            { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" },
            {
                test: /\.(ico|png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /robots\.txt$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'robots.txt'
                }
            },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] }
        ]
    },
    resolve: {
        extensions: ['.mts', '.mjs', '.js', '.ts', '.json'],
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
        },
        alias: {
            '~': path.resolve(__dirname, 'src'),
            '~components': path.resolve(__dirname, 'src/presentation/components'),
            '~pages': path.resolve(__dirname, 'src/presentation/pages')
        }
    },
    output: {
        clean: true,
        library: {
            type: 'module'
        },
        module: true,
        filename: '[name].mjs',
        path: path.resolve(__dirname, 'dist'),
    },
    target: 'web',
    plugins: [
        new ESLintWebpackPlugin({
            extensions: ['.mts', '.mjs', '.js', '.ts', '.json'],
            fix: true,
            overrideConfigFile: path.resolve(__dirname, '.eslintrc.json')
        }),
        new HtmlWebpackPlugin({
            title: 'Cathedral',
            favicon: './src/presentation/assets/icons/favicon.ico',
            scriptLoading: 'module',
            publicPath: '/'
        }),
        new GenerateSW({
            navigateFallback: 'index.html',
            clientsClaim: true,
            skipWaiting: true,
            sourcemap: true
        })
    ]
};