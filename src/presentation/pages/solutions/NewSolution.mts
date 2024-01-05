import SolutionRepository from '~/data/SolutionRepository.mjs';
import Page from '../Page.mjs';
import html from '~/presentation/lib/html.mjs';
import requiredTheme from '~/presentation/theme/requiredTheme.mjs';
import formTheme from '~/presentation/theme/formTheme.mjs';

export default class NewSolution extends Page {
    static {
        customElements.define('x-new-solution-page', this);
    }

    #repository = new SolutionRepository(localStorage);
}