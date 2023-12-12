import type { Properties } from '~/types/Properties.mjs';
import { Container } from './Container.mjs';
import html from '../lib/html.mjs';

const { template, div, slot } = html;

export type TabDirection = 'horizontal' | 'vertical';

export class Tabs extends Container {
    static {
        customElements.define('x-tabs', this);
    }

    static override get observedAttributes() {
        return [
            ...super.observedAttributes,
            'direction',
            'selected-index'
        ];
    }

    #direction!: TabDirection;
    #selectedIndex!: number;
    #tabSlot: HTMLSlotElement = this.shadowRoot.querySelector('#tab-slot')!;
    #contentSlot: HTMLSlotElement = this.shadowRoot.querySelector('#content-slot')!;
    #tabs = this.#tabSlot.assignedElements();
    #contents = this.#contentSlot.assignedElements();

    constructor({ direction, selectedIndex, ...properties }: Properties<Tabs>, children: (string | Element)[]) {
        super(properties, children);

        this.direction = direction ?? 'vertical';
        this.selectedIndex = selectedIndex ?? 0;

        [this.#tabs, this.#contents].forEach(e => e[selectedIndex].classList.add('selected'));

        Object.assign(this.#tabSlot, {
            onclick: (e: Event) => this.onTabClick(e),
            onslotchange: () => this.onTabSlotChange()
        });

        this.#contentSlot.onslotchange = () => { this.onContentSlotChange(); };
    }

    get direction(): TabDirection {
        return this.#direction;
    }

    set direction(value: TabDirection) {
        this.#direction = value;
        this.setAttribute('direction', value);
    }

    get selectedIndex() {
        return this.#selectedIndex;
    }

    set selectedIndex(value: number) {
        this.#selectedIndex = value;
        this.setAttribute('selected-index', value.toString());
    }

    onContentSlotChange() {
        this.#contents = this.#contentSlot.assignedElements();
    }

    onSelectedIndexChange(_oldValue: string, newValue: string) {
        const i = parseInt(newValue),
            tab = this.#tabs[i];
        tab?.dispatchEvent(new Event('click'));
    }

    onTabClick(e: Event) {
        const target = e.target as HTMLElement;
        if (target.slot !== 'tab')
            return;
        const tabIndex = this.#tabs.indexOf(target),
            tab = this.#tabs[tabIndex],
            content = this.#contents[tabIndex];
        if (!tab || !content)
            return;
        this.#contents.forEach(x => x.classList.remove('selected'));
        this.#tabs.forEach(x => x.classList.remove('selected'));
        tab.classList.add('selected');
        content.classList.add('selected');
    }

    onTabSlotChange() {
        this.#tabs = this.#tabSlot.assignedElements();
    }

    protected override _initShadowHtml() {
        return template([
            div({ className: 'tabs' }, [
                slot({ id: 'tab-slot', name: 'tab' })
            ]),
            div({ className: 'tab-contents' }, [
                slot({ id: 'content-slot', name: 'content' })
            ])
        ]);
    }

    protected override _initShadowStyle() {
        const base = super._initShadowStyle();

        return {
            ...base,
            ':host': {
                ...base[':host'],
                display: 'flex',
                flexDirection: 'column'
            },
            ':host([direction="vertical"])': {
                flexDirection: 'column'
            },
            ':host([direction="horizontal"])': {
                flexDirection: 'row'
            },
            '.tabs': {
                display: 'flex',
                flexDirection: 'row'
            },
            '.tabs ::slotted(*)': {
                backgroundColor: 'var(--site-dark-bg)',
                borderColor: 'var(--site-dark-bg)',
                borderRadius: 'var(--border-radius) var(--border-radius) 0 0',
                borderSize: '5px',
                borderStyle: 'solid',
                borderWidth: '0 0 5px 0',
                fontSize: '1rem',
                fontWeight: 'normal',
                cursor: 'pointer',
                margin: '0 5px',
                padding: '1rem 0.5rem 0.7em 0.5rem',
                userSelect: 'none',
            },
            '.tabs ::slotted(.selected)': {
                borderBottomColor: 'var(--link-color)',
                color: 'var(--link-color)'
            },
            '.tab-contents': {
                paddingTop: '1rem'
            },
            '.tab-contents ::slotted(*)': {
                display: 'none'
            },
            '.tab-contents ::slotted(.selected)': {
                display: 'block',
                padding: '5px'
            }
        };
    }
}