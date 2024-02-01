import { MiniCard, MiniCards } from '~components/index.mjs';
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
                new MiniCard({
                    title: 'Rationale',
                    icon: 'book-open',
                    href: `${location.pathname}/rationale`
                }),
                new MiniCard({
                    title: 'Functionality',
                    icon: 'activity',
                    href: `${location.pathname}/functionality`
                }),
                new MiniCard({
                    title: 'Stakeholders',
                    icon: 'users',
                    href: `${location.pathname}/stakeholders`
                }),
                new MiniCard({
                    title: 'Use Cases',
                    icon: 'briefcase',
                    href: `${location.pathname}/use-cases`
                }),
                new MiniCard({
                    title: 'Limitations',
                    icon: 'x-circle',
                    href: `${location.pathname}/limitations`
                })
            ])
        );
    }

    override presentItem(_entity: Goals): void { }

    override presentList(_entities: Goals[]): void { }
}