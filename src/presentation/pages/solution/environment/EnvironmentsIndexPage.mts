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
                    title: 'Components',
                    icon: 'grid',
                    href: `${location.pathname}/components`
                }),
                new MiniCard({
                    title: 'Invariants',
                    icon: 'lock',
                    href: `${location.pathname}/invariants`
                }),
                new MiniCard({
                    title: 'Assumptions',
                    // There is no icon for assumptions, so might as well use this one.
                    // "As sure as the sun rises in the east"
                    // https://en.wikipedia.org/wiki/Sunrise_problem
                    icon: 'sunrise',
                    href: `${location.pathname}/assumptions`
                }),
                new MiniCard({
                    title: 'Effects',
                    icon: 'cloud-lightning',
                    href: `${location.pathname}/effects`
                })
            ])
        );
    }
}