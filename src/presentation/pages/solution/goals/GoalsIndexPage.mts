import { MiniCard, MiniCards } from '~components/index.mjs';
import html from '~/presentation/lib/html.mjs';
import Page from '~/presentation/pages/Page.mjs';

const { p } = html;

export default class GoalsIndexPage extends Page {
    static override route = '/:solution/goals';
    static {
        customElements.define('x-page-goals-index', this);
    }

    constructor() {
        super({ title: 'Goals' }, [
            p(`Goals are the desired outcomes and needs of an
            organization for which a system must satisfy.`)
        ]);

        this.append(
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
}