import { Component, FeatherIcon } from './index.mjs';
import type { FeatherIconName } from '~/types/FeatherIconName.mjs';
import html from '../lib/html.mjs';

export interface GlobalNavLink {
    href: string;
    label: string;
    icon: FeatherIconName;
    active?: boolean;
}

/**
 * Determines if the path is the current path
 * @param path - The path to compare.
 * @param target - The target path.
 * @returns True if the path is the current path, false otherwise.
 */
const isActive = (path: string, target: string): boolean =>
    path === '/' ? target === '/' :
        target.includes(path);

export class GlobalNav extends Component {
    static {
        customElements.define('x-global-nav', this);
    }

    constructor(routes: GlobalNavLink[] = []) {
        super({});

        self.navigation.addEventListener('navigate', this);

        this.shadowRoot.querySelector('ul')!.append(
            ...routes.map(({ href, icon, label, active }) =>
                this._routerLink(href, icon, label, Boolean(active))
            )
        );
    }

    protected override _initShadowStyle() {
        return {
            ...super._initShadowStyle(),
            ':host': {
                backgroundColor: 'var(--site-dark-bg)',
                boxShadow: '2px 0 5px 0px var(--shadow-color)',
                overflow: 'hidden auto',
            },
            'ul': {
                display: 'flex',
                flexDirection: 'column',
                margin: '0',
                padding: '0',
            },
            'li': {
                alignItems: 'center',
                borderBottom: '1px solid var(--shadow-color)',
                borderTop: '1px solid hsla(0, 0%, 100%, 0.1)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                fontSize: 'large',
                height: '0.7in',
                textShadow: '0 -1px 0px var(--shadow-color)',
                width: '0.8in'
            },
            'x-feather-icon': {
                '--size': '1.5em',
            },
            '.link-active': {
                borderLeftColor: 'var(--link-color)',
                color: 'var(--link-color)',
            },
            'a': {
                alignItems: 'center',
                borderLeft: '5px solid var(--site-dark-bg)',
                boxSizing: 'border-box',
                color: 'var(--font-color)',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '10pt',
                height: '100%',
                justifyContent: 'space-evenly',
                padding: '0 0.5em',
                textDecoration: 'none',
                width: '100%',
            },
            'a:hover, a:active, a:focus': {
                backgroundColor: 'hsla(0, 0%, 100%, 0.03)',
            }
        };
    }

    protected override _initShadowHtml() {
        const { nav, ul, template } = html;

        return template(nav({ className: 'global-nav' }, ul()));
    }

    protected _routerLink(path: string, iconName: FeatherIconName, text: string, active: boolean): HTMLLIElement {
        const { a, li } = html;

        return li(a({ href: path, className: active ? 'link-active' : '' }, [
            new FeatherIcon({ icon: iconName }),
            text
        ]));
    }

    onNavigate(event: NavigateEvent) {
        if (!event.canIntercept || event.hashChange)
            return;

        const origin = document.location.origin,
            url = new URL(event.destination.url, origin),
            as = this.shadowRoot.querySelectorAll('a');

        as.forEach(a => {
            if (isActive(new URL(a.href, origin).pathname, url.pathname))
                a.classList.add('link-active');
            else
                a.classList.remove('link-active');
        });
    }
}