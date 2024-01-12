import html from '~/presentation/lib/html.mjs';
import Page from '~/presentation/pages/Page.mjs';
import { MiniCards, MiniCard } from '~components/index.mjs';

const { p } = html;

export default class EnvironmentsIndexPage extends Page {
    static override route = '/:solution/environment';
    static {
        customElements.define('x-page-environments-index', this);
    }

    constructor() {
        super({ title: 'Environments' }, [
            p(`
                An environment is the set of entities (people, organizations, regulations,
                devices and other material objects, other systems) external to the project
                or system but with the potential to affect it or be affected by it.
            `)
        ]);

        this.append(
            new MiniCards({}, [
                new MiniCard({
                    title: 'Glossary',
                    icon: 'list',
                    href: `${location.pathname}/glossary`
                }),
                new MiniCard({
                    title: 'Constraints',
                    icon: 'anchor',
                    href: `${location.pathname}/constraints`
                }),
                new MiniCard({
                    title: 'Invariants',
                    icon: 'lock',
                    href: `${location.pathname}/invariants`
                })
            ])
        );
    }
}