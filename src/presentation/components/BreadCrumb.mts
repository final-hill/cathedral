/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Component } from './index.mjs';
import html from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';

/**
 * foo-bar-baz => Foo Bar Baz
 * @param slug - The slug to convert
 * @returns The title
 */
const slugToTitle = (slug: string): string => slug.split('-')
    .map(word => word.replace(/^\w/, c => c.toUpperCase())).join(' ');

export class Breadcrumb extends Component {
    static {
        customElements.define('x-bread-crumb', this);
    }

    constructor(properties: Properties<Breadcrumb>) {
        super(properties);
        self.navigation.addEventListener('navigate', this);
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            '.bread-crumb': {
                backgroundColor: 'var(--content-bg)',
                borderBottom: '1px solid var(--shadow-color)',
                height: '100%',
                paddingLeft: '1px'
            },
            '.crumbs': {
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                margin: '0',
                padding: '0'
            },
            '.crumbs li': {
                boxSizing: 'border-box',
                display: 'flex',
                height: '100%'
            },
            '.crumbs li a': {
                alignItems: 'center',
                backgroundColor: 'var(--site-dark-bg)',
                boxSizing: 'border-box',
                clipPath: 'polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0 100%)',
                color: 'var(--font-color)',
                display: 'flex',
                height: '100%',
                padding: '0 2rem 0 1rem',
                position: 'relative',
                textDecoration: 'none'
            },
            '.crumbs li a:hover, .crumbs li a:focus': {
                backgroundColor: 'hsla(0, 0%, 100%, 0.03)'
            },
            '.crumbs li:last-child a': {
                borderLeft: '5px solid var(--link-color)',
                color: 'var(--link-color)'
            }
        };
    }

    /**
     * Creates the breadcrumb links
     * @param url - The URL to create the breadcrumbs for
     * @returns The breadcrumb links
     */
    protected _makeCrumbs(url: URL): HTMLLIElement[] {
        const crumbs = url.pathname.split('/').filter(crumb => crumb !== ''),
            paths = crumbs.map((crumb, index) => ({
                name: slugToTitle(crumb),
                path: `/${crumbs.slice(0, index + 1).join('/')}`,
            })),
            { li, a } = html;

        return [
            li(a({ href: '/' }, 'Home')),
            ...paths.map(({ name, path }) => li(a({ href: path }, name)))
        ];
    }

    protected override _initHtml() {
        const { nav, ul, template } = html;

        return template(nav({ className: 'bread-crumb' }, ul({ className: 'crumbs' },
            this._makeCrumbs(new URL(document.location.href))
        )));
    }

    onNavigate(event: NavigateEvent) {
        if (!event.canIntercept || event.hashChange)
            return;

        const url = new URL(event.destination.url),
            ul = this.shadowRoot.querySelector('.crumbs')!;
        ul.replaceChildren(...this._makeCrumbs(url));
    }
}