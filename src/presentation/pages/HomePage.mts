import SolutionInteractor from '~/application/SolutionInteractor.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import { PegsCards, type PegsCardsDeleteEvent } from '~components/index.mjs';
import Page from './Page.mjs';
import html from '../lib/html.mjs';
import type Presenter from '~/application/Presenter.mjs';
import type Solution from '~/domain/Solution.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';

const { h2 } = html;

export default class HomePage extends Page implements Presenter<Solution> {
    static override route = '/';
    static {
        customElements.define('x-page-home', this);
    }

    interactor: SolutionInteractor = new SolutionInteractor({
        presenter: this,
        repository: new SolutionRepository(localStorage)
    });

    #pegsCards = new PegsCards({
        onDelete: async (e: PegsCardsDeleteEvent) => {
            const { heading, id } = e.detail;
            if (confirm(`Are you sure you want to delete "${heading}"?`)) {
                await this.interactor.delete(id as unknown as Uuid);
                await this.interactor.presentList();
            }
        }
    });

    constructor() {
        super({ title: 'Home' });

        this.append(
            h2('Solutions'),
            this.#pegsCards
        );
    }

    override async connectedCallback() {
        super.connectedCallback();
        this.interactor.presentList();
    }

    presentList(data: Solution[]) {
        this.#pegsCards.presentList(data);
    }

    presentItem(_data: Solution) {
        throw new Error('Method not implemented.');
    }
}