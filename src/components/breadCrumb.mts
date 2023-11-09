import style from 'lib/style.mjs'
import html from 'lib/html.mjs';

style('breadcrumb', `
.breadcrumb {
    background-color: var(--content-bg);
    border-bottom: 1px solid var(--shadow-color);
    padding-left: 1px;
}

.crumbs {
    display: flex;
    flex-direction: row;
    height: 100%;
    align-items: center;

    & > li {
        box-sizing: border-box;
        height: 100%;
        display: flex;

        & a {
            align-items: center;
            background-color: var(--site-dark-bg);
            box-sizing: border-box;
            clip-path: polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0 100%);
            color: var(--font-color);
            display: flex;
            height: 100%;
            padding: 0 2rem 0 1rem;
            position: relative;
            text-decoration: none;

            &:hover,
            &:focus {
                background-color: hsla(0, 0%, 100%, 0.03);
            }
        }

        &:last-child a {
            border-left: 5px solid var(--link-color);
            color: var(--link-color)
        }
    }
}
`)

const { a, nav, ul, li } = html;

const slugToTitle = (slug: string) => slug
    .split('-')
    .map((word) => word.replace(/^\w/, (c) => c.toUpperCase()))
    .join(' ');

const crumbs = document.location.pathname.split('/').filter((crumb) => crumb !== ''),
    paths = crumbs.map((crumb, index) => {
        return {
            name: slugToTitle(crumb),
            path: `/${crumbs.slice(0, index + 1).join('/')}`,
        };
    });

export default nav({ className: 'breadcrumb' }, ul({ className: 'crumbs' },
    [
        li(a({ href: '/' }, 'Home')),
        ...paths.map(({ name, path }) => li(a({ href: path }, name)))
    ]
))