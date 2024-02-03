import { MiniCards } from '~components/index.mjs';
import html from '~/presentation/lib/html.mjs';
import _GoalsPage from './_GoalsPage.mjs';
import type Goals from '~/domain/Goals.mjs';

const { p } = html;

export default class GoalsIndexPage extends _GoalsPage {
    static override route = '/:solution/goals';
    static {
        customElements.define('x-page-goals-index', this);
    }

    constructor() {
        super({ title: 'Goals' });

        this.append(
            p(`Goals are the desired outcomes and needs of an
            organization for which a system must satisfy.`),
            new MiniCards({}, [
                {
                    label: 'Rationale',
                    icon: 'book-open',
                    href: `${location.pathname}/rationale`
                },
                {
                    label: 'Functionality',
                    icon: 'activity',
                    href: `${location.pathname}/functionality`
                },
                {
                    label: 'Stakeholders',
                    icon: 'users',
                    href: `${location.pathname}/stakeholders`
                },
                {
                    label: 'Use Cases',
                    icon: 'briefcase',
                    href: `${location.pathname}/use-cases`
                },
                {
                    label: 'Limitations',
                    icon: 'x-circle',
                    href: `${location.pathname}/limitations`
                }
            ])
        );
    }

    override presentItem(_entity: Goals): void { }

    override presentList(_entities: Goals[]): void { }
}