import { PegsCards } from '~/presentation/components/PegsCards.mjs';
import Page from '../Page.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';

export default class SolutionIndexPage extends Page {
    static override route = '/-solutions-';
    static {
        customElements.define('x-page-solution-index', this);
    }

    constructor() {
        super({ title: 'Solutions' }, [
            new PegsCards({
                repository: new SolutionRepository(localStorage)
            }, [])
        ]);
    }
}