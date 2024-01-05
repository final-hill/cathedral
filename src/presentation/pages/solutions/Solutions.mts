import { PegsCards } from '~/presentation/components/PegsCards.mjs';
import Page from '../Page.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';

export default class Solution extends Page {
    static {
        customElements.define('x-page-solution', this);
    }
    constructor() {
        super({ title: 'Solutions' }, [
            new PegsCards({
                repository: new SolutionRepository(localStorage)
            }, [])
        ]);
    }
}