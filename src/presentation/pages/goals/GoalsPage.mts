import { PegsCards } from '~components/index.mjs';
import html from '../../lib/html.mjs';
import Page from '../Page.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';

const { p } = html;

export default class GoalsPage extends Page {
    static override route = '/goals';
    static {
        customElements.define('x-goals-page', this);
    }

    constructor() {
        super({ title: 'Goals' }, [
            p(`Goals are the desired outcomes and needs of an
            organization for which a system must satisfy.`),
            new PegsCards({
                repository: new GoalsRepository(localStorage)
            }, [])
        ]);
    }
}