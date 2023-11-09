import html from 'lib/html.mjs'
import globalNav from 'components/globalNav.mjs'
import breadCrumb from 'components/breadCrumb.mjs'
import Page from 'pages/Page.mjs'

const { section } = html

export default abstract class BaseLayout extends Page {
    override get styleSheet(): string {
        return `:root {
            --btn-okay-color: hsl(209, 71%, 64%);
            --btn-danger-color: hsl(3, 93%, 63%);
            --font-color: hsl(0, 0%, 80%);
            --link-color: hsl(209, 71%, 64%);
            --site-dark-bg: hsl(212, 18%, 16%);
            --content-bg: hsl(211, 19%, 22%);
            --shadow-color: hsla(0, 0%, 0%, 0.4);
            --border-radius: 5px;
        }
        ::-webkit-scrollbar {
            -webkit-appearance: none;

            &:vertical {
                width: 0.5em;
            }

            &:horizontal {
                height: 0.5em;
            }
        }
        ::-webkit-scrollbar-thumb {
            background-color: var(--shadow-color);
            border-radius: 10px;
            border: 2px solid var(--content-bg);
        }
        ::-webkit-scrollbar-track {
            border-radius: 10px;
            background-color: var(--site-dark-bg);
        }
        body {
            background-color: var(--site-dark-bg);
            color: var(--font-color);
            display: grid;
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            grid-template-columns: fit-content(1.5in) 1fr;
            grid-template-rows: 0.5in 1fr;
            grid-template-areas:
                "global-nav breadcrumb"
                "global-nav content";
            height: 100vh;
            line-height: 1.5;
            margin: 0;
            overflow: hidden;
            padding: 0;
            width: 100vw;
        }
        h1 {
            font-size: 2em;
            margin-top: 0;
        }
        h2 {
            margin-top: 0;
        }
        a {
            color: var(--link-color);
            text-decoration: none;

            &:hover, &:active, &:focus {
                text-decoration: underline;
            }
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        input, select, textarea {
            background-color: var(--site-dark-bg);
            border-radius: var(--border-radius);
            font-size: inherit;
            padding: 0.5em;
            border: 1px inset var(--shadow-color);
            color: var(--font-color);
        }

        input:read-only {
            background-color: transparent;
        }

        button {
            background-color: var(--site-dark-bg);
            border-radius: var(--border-radius);
            color: var(--font-color);
            border: 1px solid var(--shadow-color);
            padding: 0.5em;
            font-size: inherit;
            cursor: pointer;
            transition: all 0.2s ease-in-out;

            &:hover, &:active, &:focus {
                filter: brightness(1.2);
            }
        }
        .required {
            color: var(--btn-danger-color)
        }
        th {
            background-color: var(--site-dark-bg);
            padding: 0.5em;
        }
        td {
            padding: 0.5em;
        }
        tbody tr:nth-child(even) {
            background-color: var(--site-dark-bg);
        }
        #content {
            background-color: var(--content-bg);
            grid-area: content;
            overflow: auto;
            padding: 1em 2em;
        }`
    }

    render(content: HTMLElement[]): HTMLElement[] {
        return [
            globalNav,
            breadCrumb,
            section({ id: 'content' }, content)
        ]
    }
}