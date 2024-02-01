import html from '~/presentation/lib/html.mjs';
import Page from '~/presentation/pages/Page.mjs';

const { p } = html;

export default class ProjectsIndexPage extends Page {
    static override route = '/:solution/projects';
    static {
        customElements.define('x-page-projects-index', this);
    }

    constructor() {
        super({ title: 'Projects' });

        this.append(
            p('{Projects}')
        );
    }
}