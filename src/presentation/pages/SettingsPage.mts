import html from '../lib/html.mjs';
import Page from './Page.mjs';
import pkg from '~/../package.json' with { type: 'json' };

const { h1, table, tr, td } = html;

export default class SettingPage extends Page {
    static override route = '/-settings-';
    static {
        customElements.define('x-page-settings', this);
    }

    constructor() {
        super({ title: 'Settings' });

        this.append(
            h1('Settings'),
            table(
                tr([td('Version:'), td(pkg.version)])
            )
        );
    }
}