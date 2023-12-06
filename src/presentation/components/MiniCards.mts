import html from '../lib/html.mjs';
import { Container } from './index.mjs';
import type { Properties } from '~/types/Properties.mjs';

export class MiniCards extends Container {
    static {
        customElements.define('mini-cards', this);
    }

    constructor(properties: Properties<MiniCards>, children: (Element | string)[]) {
        super(properties, children);
    }

    protected override _initHtml() {
        const { template, ul, slot } = html;

        return template(ul({ className: 'mini-cards' }, slot()));
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            '.mini-cards': {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                listStyle: 'none',
                margin: '0',
                padding: '0'
            }
        };
    }
}