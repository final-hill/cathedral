import html from "../lib/html.mjs";
import Page from "./Page.mjs";

const { p } = html

export class Home extends Page {
    static {
        customElements.define('x-page-home', this)
    }
    constructor() {
        super({ title: 'Home' }, [
            p('{Home}')
        ])
    }
}