import { Component, FeatherIcon } from './index.mjs';
import html from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';
import buttonTheme from '../theme/buttonTheme.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';

const { template, h2, a, p, button } = html;

export class PegsCard extends Component {
    static {
        customElements.define('x-pegs-card', this);
    }

    static override get observedAttributes() {
        return ['heading', 'description', 'href', 'allow-delete'];
    }

    constructor(properties: Partial<Properties<PegsCard>> & Pick<Properties<PegsCard>, 'heading' | 'description' | 'href' | 'allowDelete'>) {
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
                className: 'delete-button',
                hidden: true,
            },
                new FeatherIcon({ icon: 'trash-2' })
            )
        ]);
    }

    protected override _initShadowStyle() {
        return {
            ...super._initShadowStyle(),
            ...buttonTheme,
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
        if (confirm(`Are you sure you want to delete "${this.heading}"?`))
            this.dispatchEvent(new CustomEvent<{ id: Uuid }>('delete', {
                bubbles: true,
                composed: true,
                detail: { id: this.id as unknown as Uuid }
            }));
    }
}