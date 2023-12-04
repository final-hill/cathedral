/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { PEGS } from '~/domain/PEGS.mjs';
import { Entity } from '~/domain/Entity.mjs';
import Repository from '~/usecases/Repository.mjs';
import { Container, PegsCard } from './index.mjs';
import html from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';

const { section, template, slot } = html;

export class PegsCards extends Container {
    static {
        customElements.define('x-pegs-cards', this);
    }

    #repo?: Repository<PEGS>;

    constructor({ repository }: Properties<PegsCards>, children: (Element | string)[]) {
        super({}, children);

        this.repository = repository;

        this.addEventListener('delete', this);
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            '.pegs-cards': {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(30%, 1fr))',
                gap: '0.5in'
            },
            'x-pegs-card': {
                backgroundColor: 'var(--site-dark-bg)',
                boxShadow: '4px 5px 5px 0px var(--shadow-color)'
            },
            'x-pegs-card:first-of-type': {
                backgroundColor: 'transparent',
                border: '1px dashed var(--font-color)'
            }
        };
    }

    protected override _initHtml() {
        return template(section({ className: 'pegs-cards' },
            slot()
        ));
    }

    async _renderCards() {
        const slot = this.shadowRoot.querySelector('slot')!,
            curPath = document.location.pathname,
            elNewCard = new PegsCard({
                heading: 'New Entry',
                description: 'Create a new entry',
                href: `${curPath}/new-entry`,
                allowDelete: false
            });
        elNewCard.dataset.id = Entity.emptyId;

        if (!this.#repo) {
            slot.replaceChildren(elNewCard);
        } else {
            const items = await this.#repo.getAll(),
                newCards = [elNewCard].concat(
                    items.map(item => {
                        const card = new PegsCard({
                            allowDelete: true,
                            heading: item.name,
                            description: item.description,
                            href: `${curPath}/${item.slug()}`
                        });
                        card.dataset.id = item.id;

                        return card;
                    })
                );
            slot.replaceChildren(...newCards);
        }
    }

    get repository(): Repository<PEGS> | undefined {
        return this.#repo;
    }

    set repository(value: Repository<PEGS> | undefined) {
        this.#repo = value;
        this._renderCards();
    }

    async onDelete(e: CustomEvent<PegsCard>) {
        const card = e.detail;
        if (confirm(`Are you sure you want to delete "${card.heading}"?`)) {
            await this.#repo!.delete(card.dataset.id as PEGS['id']);
            this._renderCards();
        }
    }
}