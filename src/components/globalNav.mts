import html from "lib/html.mjs"
import style from "lib/style.mjs"
import type FeatherIcons from "assets/icons/FeatherIcons.mjs"
import featherIcon from "./featherIcon.mjs"

style('global-nav', `
.global-nav {
    background-color: var(--site-dark-bg);
    box-shadow: 2px 0 5px 0px var(--shadow-color);
    grid-area: global-nav;
    height: 100vh;
    overflow: hidden auto;

    & ul {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;

        & li {
            align-items: center;
            border-bottom: 1px solid var(--shadow-color);
            border-top: 1px solid hsla(0, 0%, 100%, 0.1);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            font-size: large;
            height: 0.7in;
            text-shadow: 0 -1px 0px var(--shadow-color);

            & .feather-icon {
                height: 30px;
                width: 30px;
            }

            & .link-active {
                border-left-color: var(--link-color);
                color: var(--link-color);
            }

            & a {
                align-items: center;
                border-left: 5px solid var(--site-dark-bg);
                box-sizing: border-box;
                color: var(--font-color);
                display: flex;
                flex-direction: column;
                font-size: 10pt;
                height: 100%;
                justify-content: space-evenly;
                padding: 0 0.5em;
                text-decoration: none;
                width: 100%;

                &:hover, &:active, &:focus {
                    background-color: hsla(0, 0%, 100%, 0.03);
                }
            }
        }
    }
}
`)

const { a, nav, ul, li } = html

const isActive = (path: string) =>
    path === '/' ? document.location.pathname === '/' :
        document.location.pathname.includes(path)

const routerLink = (path: string, iconName: FeatherIcons, text: string) => li([
    a({ className: isActive(path) ? 'link-active' : '', href: path }, [
        featherIcon(iconName),
        text
    ])
])

export default nav({ className: 'global-nav' },
    ul([
        routerLink('/', 'home', 'Home'),
        routerLink('/projects', 'package', 'Projects'),
        routerLink('/environments', 'cloud', 'Environments'),
        routerLink('/goals', 'target', 'Goals')
    ])
)
