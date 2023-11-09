import FeatherIcons from "assets/icons/FeatherIcons.mjs";
import html from "lib/html.mjs";
import style from "lib/style.mjs";
import featherIcon from "./featherIcon.mjs";

style('mini-cards', `
.mini-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    list-style: none;
    margin: 0;
    padding: 0;

    & .mini-card {
        align-items: center;
        background-color: var(--site-dark-bg);
        border-radius: 0.5rem;
        box-shadow: 0 0 5px 0px var(--shadow-color);
        display: flex;
        flex-direction: column;
        margin: 0.5rem;
        padding: 1rem;
        width: 10rem;

        & a {
            align-items: center;
            color: var(--site-light-bg);
            display: flex;
            flex-direction: column;
            text-decoration: none;
            width: 100%;
        }
    }
}
`)

const { ul, li, a, span } = html

export type MiniCardItem = {
    url: string,
    title: string,
    icon: FeatherIcons
}

export default (items: MiniCardItem[]) => ul({ className: 'mini-cards' },
    items.map(({ url, title, icon }) =>
        li({ className: 'mini-card' }, a({ href: url }, [
            featherIcon(icon),
            span(title)
        ]))
    )
)
