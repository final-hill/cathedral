import html from '../../lib/html.mjs';
import Page from '../Page.mjs';

const { p } = html;

export class Projects extends Page {
    static {
        customElements.define('x-projects-page', this);
    }
    constructor() {
        super({ title: 'Projects' }, [
            p('{Projects}')
        ]);
    }
}