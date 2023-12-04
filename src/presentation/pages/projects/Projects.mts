/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import html from '../../lib/html.mjs';
import Page from '../Page.mjs';

const { p } = html;

export class Projects extends Page {
    static {
        customElements.define('x-projects-page', this);
    }
    constructor() {
        super({ title: 'Projects' }, [
            p('{Projects}')
        ]);
    }
}