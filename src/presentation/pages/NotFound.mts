import Page from "./Page.mjs";
import html from "../lib/html.mjs"

const { h1, p, a } = html

export class NotFound extends Page {
    static {
        customElements.define('x-page-not-found', this)
    }
    constructor() {
        super({ title: '404 - Page not found' }, [
            h1('404'),
            p('Page not found'),
            a({ href: '/' }, 'Home')
        ])
    }
}