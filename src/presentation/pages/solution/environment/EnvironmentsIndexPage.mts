import html from '~/presentation/lib/html.mjs';
import { MiniCards } from '~components/index.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';
import { type Entity } from '~/domain/index.mjs';

const { p } = html;

export default class EnvironmentsIndexPage extends _EnvironmentPage {
    static override route = '/:solution/environment';
    static {
        customElements.define('x-page-environments-index', this);
    }

    constructor() {
        super({ title: 'Environments' });

        this.append(
            p(`
                An environment is the set of entities (people, organizations, regulations,
                devices and other material objects, other systems) external to the project
                or system but with the potential to affect it or be affected by it.
            `),
            new MiniCards({}, [
                {
                    label: 'Glossary',
                    icon: 'list',
                    href: `${location.pathname}/glossary`
                },
                {
                    label: 'Constraints',
                    icon: 'anchor',
                    href: `${location.pathname}/constraints`
                },
                {
                    label: 'Components',
                    icon: 'grid',
                    href: `${location.pathname}/components`
                },
                {
                    label: 'Invariants',
                    icon: 'lock',
                    href: `${location.pathname}/invariants`
                },
                {
                    label: 'Assumptions',
                    // There is no icon for assumptions, so might as well use this one.
                    // "As sure as the sun rises in the east"
                    // https://en.wikipedia.org/wiki/Sunrise_problem
                    icon: 'sunrise',
                    href: `${location.pathname}/assumptions`
                },
                {
                    label: 'Effects',
                    icon: 'cloud-lightning',
                    href: `${location.pathname}/effects`
                }
            ])
        );
    }

    override presentItem(_entity: Entity) { }

    override presentList(_entities: Entity[]) { }
}