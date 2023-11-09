import path from 'path';
import url from 'url';
import { glob } from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = url.fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);

const pagePaths = glob.sync('./src/pages/**/*.mts')
    .map(path => `./${path.replace(/\\/g, '/')}`);

const entry = pagePaths.reduce((entries, pagePath) => {
    const entryChunkName = pagePath.replace('./src/pages/', '').replace('.mts', '');
    entries[entryChunkName] = pagePath;
    return entries;
}, Object.create(null))

const templateContent = ({ htmlWebpackPlugin }) => `<html lang="en-US" dir="ltr">
<head>
<title>${htmlWebpackPlugin.options.title}</title>
</head>
<body></body>
</html>`

const meta = {
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1'
}

export default {
    devtool: 'source-map',
    entry,
    experiments: {
        outputModule: true
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.([cm]?ts|tsx)$/,
                use: 'ts-loader'
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ]
    },
    resolve: {
        alias: {
            assets: path.resolve(__dirname, 'src/assets'),
            components: path.resolve(__dirname, 'src/components'),
            data: path.resolve(__dirname, 'src/data'),
            domain: path.resolve(__dirname, 'src/domain'),
            layouts: path.resolve(__dirname, 'src/layouts'),
            lib: path.resolve(__dirname, 'src/lib'),
            pages: path.resolve(__dirname, 'src/pages'),
            usecases: path.resolve(__dirname, 'src/usecases')
        },
        extensions: ['.mts', '.mjs', '.js', '.ts', '.json'],
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
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
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: './static', to: './' },
            ]
        }),
        ...pagePaths.map(path =>
            new HtmlWebpackPlugin({
                title: 'Cathedral',
                favicon: 'src/assets/icons/favicon.ico',
                meta,
                scriptLoading: 'module',
                chunks: [path.replace('./src/pages/', '').replace('.mts', '')],
                filename: path.replace('./src/pages/', '').replace('.mts', '.html'),
                templateContent
            })
        )
    ]
};