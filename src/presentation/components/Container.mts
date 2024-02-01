import type { Properties } from '~/types/Properties.mjs';
import html from '../lib/html.mjs';
import { Component } from './index.mjs';
import type { Theme } from '~/types/Theme.mjs';

export abstract class Container extends Component {
    constructor(properties: Partial<Properties<Container>>, children: (Element | string)[] = []) {
        super(properties);

        this.append(...children);
    }

    protected override _initShadowStyle(): Theme {
        return {
            ...super._initShadowStyle(),
            '::-webkit-scrollbar': {
                appearance: 'none'
            },
            '::-webkit-scrollbar:vertical': {
                width: '15px'
            },
            '::-webkit-scrollbar:horizontal': {
                height: '15px'
            },
            '::-webkit-scrollbar-thumb': {
                backgroundColor: 'var(--shadow-color)',
                borderRadius: 'var(--border-radius)',
                border: '2px solid var(--content-bg)',
            },
            '::-webkit-scrollbar-track': {
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--site-dark-bg)'
            }
        };
    }

    protected override _initShadowHtml() {
        const { template, slot } = html;

        return template(slot());
    }
}