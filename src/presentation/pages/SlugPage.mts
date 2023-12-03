import Page from "./Page.mjs";
import html from "../lib/html.mjs";
import type { Properties } from "~/types/Properties.mjs";

const { p } = html

/**
 * A page that utilizes a slug identifier.
 */
export abstract class SlugPage extends Page {
    // /parent/:slug/foo
    #slug = new URL(location.href).pathname.split('/')[2]

    constructor(properties: Properties<SlugPage>, children: (string | Element)[]) {
        super(properties, children)

        if (!this.#slug)
            this.initNoSlugError()
        else
            this.init()
    }

    init() {
        this.shadowRoot.querySelector('slot')!.replaceChildren(
            p('No slug identifier provided')
        )
    }

    initNoSlugError() {
        this.shadowRoot.querySelector('slot')!.replaceChildren(
            p('No slug identifier provided')
        )
    }

    get slug() {
        return this.#slug
    }
}