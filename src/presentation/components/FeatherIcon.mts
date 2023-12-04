/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Component } from './index.mjs';
import type { FeatherIconName } from '~/types/FeatherIconName.mjs';
import html from '../lib/html.mjs';
// @ts-ignore
import svgPath from 'feather-icons/dist/feather-sprite.svg';
import type { Properties } from '~/types/Properties.mjs';

const xmlnsSvg = 'http://www.w3.org/2000/svg';

export class FeatherIcon extends Component {
    static {
        customElements.define('x-feather-icon', this);
    }

    static override get observedAttributes() {
        return ['icon'];
    }

    constructor(properties: Properties<FeatherIcon>) {
        super(properties);
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            '.feather-icon': {
                stroke: 'currentColor',
                display: 'inline-block',
                height: 'var(--size)',
                width: 'var(--size)',
            }
        };
    }

    protected override _initHtml() {
        const { template } = html,
            svg = document.createElementNS(xmlnsSvg, 'svg'),
            use = document.createElementNS(xmlnsSvg, 'use');
        svg.classList.add('feather-icon');
        svg.appendChild(use);

        return template(svg);
    }

    get icon(): FeatherIconName { return this.getAttribute('icon') as FeatherIconName; }
    set icon(value: FeatherIconName) { this.setAttribute('icon', value); }

    onIconChanged(_oldValue: FeatherIconName, newValue: FeatherIconName) {
        this.shadowRoot.querySelector('use')!.setAttribute('href', `${svgPath}#${newValue}`);
    }
}