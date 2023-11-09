import { qs } from "lib/query.mjs"

export default abstract class Page {
    constructor() {
        this._renderStyle()
    }

    protected _renderStyle(): void {
        const id = this.constructor.name
        let style = qs<HTMLStyleElement>(`style#${id}`, document.head)!

        if (style)
            return

        style = document.createElement('style')
        style.id = id

        const cssText = document.createTextNode(this.styleSheet)
        style.appendChild(cssText)

        document.head.appendChild(style)
    }

    get styleSheet(): string { return '' }

    abstract render(content: Element[]): Element[]
}