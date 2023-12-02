import type { Properties } from "~/types/Properties.mjs"
import { HandleEvent } from "../HandleEvent.mjs"

export abstract class Component extends HandleEvent(HTMLElement) {
    static get observedAttributes(): string[] {
        return []
    }

    constructor(properties: Properties<Component>) {
        super()

        if (!this.shadowRoot) {
            const shadowRoot = this.attachShadow({ mode: 'open' }),
                sheet = new CSSStyleSheet(),
                template = this._initHtml(),
                rules = this._initStyle(),
                styleElement = document.createElement('style')

            // Convert the rules object into a CSSStyleSheet
            for (const [head, body] of Object.entries(rules)) {
                const i = sheet.insertRule(`${head} {}`),
                    // @ts-expect-error: TS doesn't know about the style property
                    { style } = sheet.cssRules[i]
                for (const [property, value] of Object.entries(body)) {
                    if (property.startsWith('--'))
                        style.setProperty(property, value)
                    else
                        style[property] = value
                }
                styleElement.textContent += sheet.cssRules[i].cssText + '\n'
            }

            // For some reason this approach doesn't work when nesting components.
            // shadowRoot.adoptedStyleSheets = [sheet]
            shadowRoot.append(
                styleElement,
                template.content.cloneNode(true)
            )

            // Set the component's properties
            Object.assign(this, properties)
        }
    }

    // eliminate the need to cast shadowRoot to non-null
    override get shadowRoot() {
        return super.shadowRoot!
    }

    /**
     * A document fragment that contains the HTML for the component
     */
    protected _initHtml(): HTMLTemplateElement {
        return document.createElement('template')
    }

    /**
     * An object literal that contains the CSS style declarations for the component
     */
    protected _initStyle(): Record<string, Partial<CSSStyleDeclaration>> {
        return {
            ':host': {
                boxSizing: 'border-box'
            }
        }
    }

    /**
     * Called when attributes are changed, added, removed, or replaced
     */
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return

        const propName = name.replace(/-?\b([a-z])/g, (_, w) => w[0].toUpperCase()),
            handlerName = `on${propName}Changed`,
            handler = Reflect.get(this, handlerName)

        if (typeof handler === 'function')
            handler.call(this, oldValue, newValue)
    }
}