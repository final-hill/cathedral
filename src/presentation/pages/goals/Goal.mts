/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import Page from '../Page.mjs';
import { MiniCards, MiniCard } from '~/presentation/components/index.mjs';

export class Goal extends Page {
    static {
        customElements.define('x-goal-page', this);
    }

    constructor() {
        super({ title: 'Goal' }, [
            new MiniCards({}, [
                new MiniCard({
                    title: 'Rationale',
                    icon: 'book-open',
                    href: `${location.pathname}/rationale`
                }),
                new MiniCard({
                    title: 'Functionality',
                    icon: 'activity',
                    href: `${location.pathname}/functionality`
                }),
                new MiniCard({
                    title: 'Stakeholders',
                    icon: 'users',
                    href: `${location.pathname}/stakeholders`
                }),
            ])
        ]);
    }
}