import type { Properties } from '~/types/Properties.mjs';
import type { Theme } from '~/types/Theme.mjs';

export abstract class Component extends HTMLElement {
    static get observedAttributes(): string[] {
        return [];
    }

    constructor(properties: Partial<Properties<Component>>) {
        super();

        if (!this.shadowRoot) {
            const shadowRoot = this.attachShadow({ mode: 'open' }),
                sheet = new CSSStyleSheet(),
                template = this._initShadowHtml(),
                rules = this._initShadowStyle(),
                styleElement = document.createElement('style');

            // Convert the rules object into a CSSStyleSheet
            for (const [head, body] of Object.entries(rules)) {
                const i = sheet.insertRule(`${head} {}`),
                    // @ts-expect-error: TS doesn't know about the style property
                    { style } = sheet.cssRules[i];
                for (const [property, value] of Object.entries(body))
                    if (property.startsWith('--'))
                        style.setProperty(property, value);
                    else
                        style[property] = value;

                styleElement.textContent += `${sheet.cssRules[i].cssText}\n`;
            }

            // For some reason this approach doesn't work when nesting components.
            // shadowRoot.adoptedStyleSheets = [sheet]
            shadowRoot.append(
                styleElement,
                template.content.cloneNode(true)
            );

            Object.assign(this, properties);
        }
    }

    // eliminate the need to cast shadowRoot to non-null
    override get shadowRoot() {
        return super.shadowRoot!;
    }

    /**
     * A callback that is invoked when an event is dispatched to the component.
     * @param event The event that was dispatched.
     * @returns void
     */
    handleEvent(event: Event): void {
        const eventName = event.type.charAt(0).toUpperCase() + event.type.slice(1),
            handler = Reflect.get(this, `on${eventName}`);
        if (typeof handler === 'function')
            handler.call(this, event);
    }

    /**
     * A document fragment that contains the HTML for the component
     * @returns The HTML template
     */
    protected _initShadowHtml(): HTMLTemplateElement {
        return document.createElement('template');
    }

    /**
     * An object literal that contains the CSS style declarations for the component
     * @returns The CSS rules
     */
    protected _initShadowStyle(): Theme {
        return {
            ':host': {
                boxSizing: 'border-box'
            }
        };
    }

    /**
     * Called when attributes are changed, added, removed, or replaced
     * @param name The name of the attribute that changed
     * @param oldValue The previous value of the attribute
     * @param newValue The new value of the attribute
     * @returns void
     */
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return;

        const propName = name.replace(/-?\b([a-z])/g, (_, w) => w[0].toUpperCase()),
            handlerName = `on${propName}Changed`,
            handler = Reflect.get(this, handlerName);

        if (typeof handler === 'function')
            handler.call(this, oldValue, newValue);
    }
}