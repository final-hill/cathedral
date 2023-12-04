/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import Page from './Page.mjs';
import html from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';

const { p } = html;

/**
 * A page that utilizes a slug identifier.
 */
export abstract class SlugPage extends Page {
    // /parent/:slug/foo
    #slug = new URL(location.href).pathname.split('/')[2];

    constructor(properties: Properties<SlugPage>, children: (string | Element)[]) {
        super(properties, children);

        if (!this.#slug)
            this.initNoSlugError();
        else
            this.init();
    }

    init() {
        this.shadowRoot.querySelector('slot')!.replaceChildren(
            p('No slug identifier provided')
        );
    }

    initNoSlugError() {
        this.shadowRoot.querySelector('slot')!.replaceChildren(
            p('No slug identifier provided')
        );
    }

    get slug() {
        return this.#slug;
    }
}