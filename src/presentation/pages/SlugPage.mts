import Page from './Page.mjs';
import html, { renderIf } from '../lib/html.mjs';
import type { Properties } from '~/types/Properties.mjs';

const { p } = html;

/**
 * A page that utilizes a slug identifier.
 */
export default abstract class SlugPage extends Page {
    // /parent/:slug/foo
    #slug = new URL(location.href, document.location.origin).pathname.split('/')[2];

    constructor(properties: Properties<SlugPage>, children: (string | Element)[]) {
        super(properties, children);

        this.appendChild(
            p({
                [renderIf]: !this.#slug
            }, 'No slug identifier provided')
        );
    }

    get slug() {
        return this.#slug;
    }
}