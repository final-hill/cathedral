import type { FeatherIconName } from '~/types/FeatherIconName.mjs';
import html from '../lib/html.mjs';
import { Component, FeatherIcon } from './index.mjs';
import type { Properties } from '~/types/Properties.mjs';
import buttonTheme from '../theme/buttonTheme.mjs';

export interface MiniCard {
    label: string;
    icon: FeatherIconName;
    href: string;
}

const { ul, li, a, span, template } = html;

export class MiniCards extends Component {
    static {
        customElements.define('x-mini-cards', this);
    }

    constructor(properties: Partial<Properties<MiniCards>>, cards: MiniCard[]) {
        super(properties);

        this.shadowRoot.querySelector('ul')!.append(
            ...cards.map(({ href, icon, label }) =>
                li({ className: 'mini-card' }, [
                    a({ href }, [
                        new FeatherIcon({ icon }),
                        span(label)
                    ])
                ])
            )
        );
    }

    protected override _initShadowHtml() {
        return template(ul({ className: 'mini-cards' }));
    }

    protected override _initShadowStyle() {
        return {
            ...super._initShadowStyle(),
            ...buttonTheme,
            '.mini-cards': {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                listStyle: 'none',
                margin: '0',
                padding: '0'
            },
            '.mini-card': {
                alignItems: 'center',
                backgroundColor: 'var(--site-dark-bg)',
                borderRadius: '0.5em',
                boxShadow: '0 0 5px 0px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                margin: '0.5em',
                padding: '1em',
                width: '10em',
            },
            '.mini-card:hover': {
                filter: 'brightness(1.2)'
            },
            'a': {
                alignItems: 'center',
                color: 'var(--site-light-bg)',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                width: '100%',
            },
            'x-feather-icon': {
                '--size': '2em',
            }
        };
    }
}