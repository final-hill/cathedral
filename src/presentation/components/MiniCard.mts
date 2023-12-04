/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Component, FeatherIcon } from './index.mjs';
import html from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';
import type { FeatherIconName } from '~/types/FeatherIconName.mjs';

export class MiniCard extends Component {
    static {
        customElements.define('x-mini-card', this);
    }

    static override get observedAttributes() {
        return ['title', 'href', 'icon'];
    }

    constructor(properties: Properties<MiniCard>) {
        super(properties);
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            '.mini-card': {
                alignItems: 'center',
                backgroundColor: 'var(--site-dark-bg)',
                borderRadius: '0.5em',
                boxShadow: '0 0 5px 0px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                margin: '0.5em',
                padding: '1em',
                width: '10em',
            },
            'a': {
                alignItems: 'center',
                color: 'var(--site-light-bg)',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                width: '100%',
            },
            'x-feather-icon': {
                '--size': '2em',
            }
        };
    }

    protected override _initHtml() {
        const { li, a, span, template } = html;

        return template(li({ className: 'mini-card' }, [
            a({ href: '#' }, [
                new FeatherIcon({ icon: 'help-circle' }),
                span()
            ])
        ]));
    }

    override get title() { return this.getAttribute('title')!; }
    override set title(value) { this.setAttribute('title', value); }

    onTitleChanged(oldValue: string, newValue: string) {
        this.shadowRoot.querySelector('span')!.textContent = newValue;
    }

    get href() { return this.getAttribute('href')!; }
    set href(value) { this.setAttribute('href', value); }

    onHrefChanged(oldValue: string, newValue: string) {
        this.shadowRoot.querySelector('a')!.setAttribute('href', newValue);
    }

    get icon() { return this.getAttribute('icon')!; }
    set icon(value) { this.setAttribute('icon', value); }

    onIconChanged(oldValue: FeatherIconName, newValue: FeatherIconName) {
        this.shadowRoot.querySelector<FeatherIcon>('x-feather-icon')!.setAttribute('icon', newValue);
    }
}