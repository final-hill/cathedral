import Page from '../Page.mjs';
import { MiniCards, MiniCard } from '~/presentation/components/index.mjs';

export class Goal extends Page {
    static {
        customElements.define('x-goal-page', this);
    }

    constructor() {
        super({ title: 'Goal' }, [
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
        ]);
    }
}