import Page from './Page.mjs';
import html from '../lib/html.mjs';

const { h1, p } = html;

export default class NotFoundPage extends Page {
    static override route = '/-not-found-';
    static {
        customElements.define('x-page-not-found', this);
    }
    constructor() {
        super({ title: 'Page not found' });

        this.append(h1('Page not found'),
            p({ className: 'error-message' }, this.urlParams.message ?? '')
        );
    }

    override _initPageStyle() {
        return {
            ...super._initPageStyle(),
            '.error-message': {
                color: 'red',
                fontSize: '1.5em',
                fontWeight: 'bold',
            }
        };
    }
}