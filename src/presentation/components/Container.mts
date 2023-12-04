/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type { Properties } from '~/types/Properties.mjs';
import html from '../lib/html.mjs';
import { Component } from './index.mjs';

export abstract class Container extends Component {
    constructor(properties: Properties<Container>, children: (Element | string)[]) {
        super(properties);

        const slot = this.shadowRoot?.querySelector('slot');

        if (!slot)
            throw new Error('Container must have a slot');

        slot.append(...children);
    }

    protected override _initHtml() {
        const { template, slot } = html;

        return template(slot());
    }
}