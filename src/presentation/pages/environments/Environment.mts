/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { MiniCards, MiniCard } from '~/presentation/components/index.mjs';
import Page from '../Page.mjs';

export class Environment extends Page {
    static {
        customElements.define('x-environment-page', this);
    }

    constructor() {
        super({ title: 'Environment' }, [
            new MiniCards({}, [
                new MiniCard({
                    title: 'Glossary',
                    icon: 'list',
                    href: `${location.pathname}/glossary`
                }),
            ])
        ]);
    }
}