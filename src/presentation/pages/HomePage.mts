import html from '../lib/html.mjs';
import Page from './Page.mjs';

const { p } = html;

export default class HomePage extends Page {
    static override route = '/';
    static {
        customElements.define('x-page-home', this);
    }
    constructor() {
        super({ title: 'Home' }, [
            p('{Home}')
        ]);
    }
}