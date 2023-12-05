import path from 'path';
import url from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import { GenerateSW } from 'workbox-webpack-plugin';
import pkg from './package.json' with { type: "json" }

const __filename = url.fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);

export default {
    mode: 'production',
    entry: {
        main: './src/main.mts'
    },
    experiments: {
        outputModule: true
    },
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
        new FaviconsWebpackPlugin({
            logo: './src/presentation/assets/images/logo.png',
            logoMaskable: './src/presentation/assets/images/logo-maskable.png',
            cache: true,
            favicons: {
                appName: 'Cathedral',
                appDescription: pkg.description,
                developerName: pkg.author,
                developerURL: pkg.homepage,
                display: 'standalone',
                theme_color: '#212830',
                background: '#2d3843',
                lang: 'en-US',
                icons: {
                    coast: false,
                    yandex: false
                }
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Cathedral',
            scriptLoading: 'module',
            publicPath: '/',
            templateContent: ({ htmlWebpackPlugin }) => `
                <!DOCTYPE html>
                <html lang="en" dir='ltr'>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <title>${htmlWebpackPlugin.options.title}</title>
                        <meta name="description" content="${pkg.description}">
                    </head>
                    <body>
                        Loading...
                        <noscript>
                            This application requires JavaScript to be enabled.
                        </noscript>
                    </body>
                </html>`
        }),
        new GenerateSW({
            navigateFallback: 'index.html',
            clientsClaim: true,
            skipWaiting: true,
            sourcemap: true
        })
    ]
};