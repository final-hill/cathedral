import { PegsCards, type PegsCardsDeleteEvent } from '~components/PegsCards.mjs';
import _SolutionPage from './_SolutionPage.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';
import type Solution from '~/domain/Solution.mjs';

export default class SolutionIndexPage extends _SolutionPage {
    static override route = '/-solutions-';
    static {
        customElements.define('x-page-solution-index', this);
    }

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
        super({ title: 'Solutions' });
        this.append(this.#pegsCards);
    }

    override presentList(data: Solution[]): void {
        this.#pegsCards.presentList(data);
    }
}