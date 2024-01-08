import html from '../../lib/html.mjs';
import Page from '../Page.mjs';

const { p } = html;

export default class ProjectsPage extends Page {
    static override route = '/projects';
    static {
        customElements.define('x-projects-page', this);
    }

    constructor() {
        super({ title: 'Projects' }, [
            p('{Projects}')
        ]);
    }
}