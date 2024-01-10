import SolutionRepository from '~/data/SolutionRepository.mjs';
import { PegsCards } from '../components/PegsCards.mjs';
import Page from './Page.mjs';
import html from '../lib/html.mjs';

const { h2 } = html;

export default class HomePage extends Page {
    static override route = '/';
    static {
        customElements.define('x-page-home', this);
    }

    #repository = new SolutionRepository(localStorage);

    constructor() {
        super({ title: 'Home' }, []);

        this.append(
            h2('Solutions'),
            new PegsCards({
                repository: this.#repository
            }, [])
        );
    }
}