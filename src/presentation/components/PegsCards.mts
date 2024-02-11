import { SlugEntity, emptyUuid, type Uuid } from '~/domain/index.mjs';
import type Presenter from '~/application/Presenter.mjs';
import { Container, PegsCard } from './index.mjs';
import html from '../lib/html.mjs';

const { section, template, slot } = html;

export type PegsCardsDeleteEvent = CustomEvent<{ id: Uuid; heading: string }>;

export class PegsCards extends Container implements Presenter<SlugEntity> {
    static {
        customElements.define('x-pegs-cards', this);
    }

    constructor({ onDelete }: { onDelete: (e: PegsCardsDeleteEvent) => void }) {
        super({}, []);

        this.addEventListener('delete', e => onDelete(e as PegsCardsDeleteEvent));
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

    presentItem(_entity: SlugEntity): void {
        throw new Error('Method not implemented.');
    }

    presentList(entities: SlugEntity[]): void {
        const curPath = document.location.pathname,
            elNewCard = new PegsCard({
                id: emptyUuid,
                heading: 'New Entry',
                description: 'Create a new entry',
                href: `${curPath === '/' ? '' : curPath}/new-entry`,
                allowDelete: false
            }),
            newCards = [elNewCard].concat(
                entities.map(entity => {
                    const card = new PegsCard({
                        id: entity.id,
                        allowDelete: true,
                        heading: entity.name,
                        description: entity.description,
                        href: `${curPath === '/' ? '' : curPath}/${entity.slug()}`
                    });

                    return card;
                })
            );
        this.replaceChildren(...newCards);
    }
}