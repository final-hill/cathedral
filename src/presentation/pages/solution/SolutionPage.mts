import { MiniCards } from '~/presentation/components/MiniCards.mjs';
import Page from '../Page.mjs';
import { MiniCard } from '~/presentation/components/MiniCard.mjs';

export default class SolutionPage extends Page {
    static override route = '/:solution';
    static {
        customElements.define('x-page-solution', this);
    }
    constructor() {
        super({ title: 'Solutions' }, [
            new MiniCards({}, [
                new MiniCard({
                    title: 'Project',
                    icon: 'package',
                    href: `${location.pathname}/project`
                }),
                new MiniCard({
                    title: 'Environment',
                    icon: 'cloud',
                    href: `${location.pathname}/environment`
                }),
                new MiniCard({
                    title: 'Goals',
                    icon: 'target',
                    href: `${location.pathname}/goals`
                }),
                new MiniCard({
                    title: 'System',
                    icon: 'cpu',
                    href: `${location.pathname}/system`
                }),
            ])
        ]);
    }
}