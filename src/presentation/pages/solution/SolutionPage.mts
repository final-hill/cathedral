import { MiniCard, MiniCards } from '~components/index.mjs';
import _SolutionPage from './_SolutionPage.mjs';

export default class SolutionPage extends _SolutionPage {
    static override route = '/:solution';
    static {
        customElements.define('x-page-solution', this);
    }

    constructor() {
        super({ title: 'Solutions' });

        this.append(
            new MiniCards({}, [])
        );
    }

    override presentList(): void {
        this.querySelector('x-mini-cards')!.replaceChildren(
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
            })
        );
    }
}