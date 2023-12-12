import { Component, FeatherIcon } from './index.mjs';
import html from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';

const { template, h2, a, p, button } = html;

export class PegsCard extends Component {
    static {
        customElements.define('x-pegs-card', this);
    }

    static override get observedAttributes() {
        return ['heading', 'description', 'href', 'allow-delete'];
    }

    constructor(properties: Properties<PegsCard>) {
        super(properties);
        this.shadowRoot.querySelector('button')!.addEventListener('click', e => this.onDelete(e));
    }

    protected override _initShadowHtml() {
        return template([
            h2({ className: 'title' },
                a({ href: '#' }, '{heading}')
            ),
            p('{description}'),
            button({
                className: 'delete-btn',
                hidden: true,
            },
                new FeatherIcon({ icon: 'trash-2' })
            )
        ]);
    }

    protected override _initShadowStyle() {
        return {
            ':host': {
                ...super._initShadowStyle()[':host'],
                backgroundColor: 'var(--site-dark-bg)',
                boxShadow: '4px 5px 5px 0px var(--shadow-color)',
                padding: '1em',
            },
            ':host(:hover)': {
                filter: 'brightness(1.2)'
            },
            ':host(:first-of-type)': {
                backgroundColor: 'transparent',
                border: '1px dashed var(--font-color)'
            },
            '.delete-btn': {
                alignSelf: 'center',
                backgroundColor: 'var(--site-dark-bg)',
                color: 'var(--btn-danger-color)',
                height: 'fit-content',
                width: 'fit-content'
            },
            '.delete-btn x-feather-icon': {
                '--size': '1.5em'
            },
            '.title': {
                marginTop: '0'
            },
            'a': {
                color: 'var(--link-color)',
                textDecoration: 'none'
            }
        };
    }

    get allowDelete() { return this.getAttribute('allow-delete') === 'true'; }
    set allowDelete(value) { this.setAttribute('allow-delete', value.toString()); }

    onAllowDeleteChanged(_oldValue: string, newValue: string) {
        this.shadowRoot.querySelector('button')!.hidden = newValue !== 'true';
    }

    get description() { return this.getAttribute('description') ?? ''; }
    set description(value) { this.setAttribute('description', value); }

    onDescriptionChanged(_oldValue: string, newValue: string) {
        this.shadowRoot.querySelector('p')!.textContent = newValue;
    }

    get heading() { return this.getAttribute('heading') ?? ''; }
    set heading(value) { this.setAttribute('heading', value); }

    onHeadingChanged(_oldValue: string, newValue: string) {
        this.shadowRoot.querySelector('.title a')!.textContent = newValue;
    }

    get href() { return this.getAttribute('href') ?? ''; }
    set href(value) { this.setAttribute('href', value); }

    onHrefChanged(_oldValue: string, newValue: string) {
        this.shadowRoot.querySelector('a')!.href = newValue;
    }

    onDelete(e: Event) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent<this>('delete', {
            bubbles: true,
            composed: true,
            detail: this
        }));
    }
}