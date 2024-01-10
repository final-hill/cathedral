import SlugEntity from '~/domain/SlugEntity.mjs';
import Entity from '~/domain/Entity.mjs';
import Repository from '~/usecases/Repository.mjs';
import { Container, PegsCard } from './index.mjs';
import html from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';

const { section, template, slot } = html;

export class PegsCards extends Container {
    static {
        customElements.define('x-pegs-cards', this);
    }

    #repo?: Repository<SlugEntity>;

    constructor({ repository }: Properties<PegsCards>, children: (Element | string)[]) {
        super({}, children);

        this.repository = repository;

        this.addEventListener('delete', this);
    }

    protected override _initShadowStyle() {
        return {
            ...super._initShadowStyle(),
            '.pegs-cards': {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(30%, 1fr))',
                gap: '0.5in'
            }
        };
    }

    protected override _initShadowHtml() {
        return template(section({ className: 'pegs-cards' },
            slot()
        ));
    }

    async _renderCards() {
        const curPath = document.location.pathname,
            elNewCard = new PegsCard({
                heading: 'New Entry',
                description: 'Create a new entry',
                href: `${curPath === '/' ? '' : curPath}/new-entry`,
                allowDelete: false
            });
        elNewCard.dataset.id = Entity.emptyId;

        if (!this.#repo) {
            this.replaceChildren(elNewCard);
        } else {
            const items = await this.#repo.getAll(),
                newCards = [elNewCard].concat(
                    items.map(item => {
                        const card = new PegsCard({
                            allowDelete: true,
                            heading: item.name,
                            description: item.description,
                            href: `${curPath === '/' ? '' : curPath}/${item.slug()}`
                        });
                        card.dataset.id = item.id;

                        return card;
                    })
                );
            this.replaceChildren(...newCards);
        }
    }

    get repository(): Repository<SlugEntity> | undefined {
        return this.#repo;
    }

    set repository(value: Repository<SlugEntity> | undefined) {
        this.#repo = value;
        this._renderCards();
    }

    async onDelete(e: CustomEvent<PegsCard>) {
        const card = e.detail;
        if (confirm(`Are you sure you want to delete "${card.heading}"?`)) {
            await this.#repo!.delete(card.dataset.id as SlugEntity['id']);
            this._renderCards();
        }
    }
}