import { MiniCards } from '~components/index.mjs';
import _SolutionPage from './_SolutionPage.mjs';

export default class SolutionPage extends _SolutionPage {
    static override route = '/:solution';
    static {
        customElements.define('x-page-solution', this);
    }

    constructor() {
        super({ title: 'Solutions' });

        this.append(
            new MiniCards({}, [
                {
                    label: 'Project',
                    icon: 'package',
                    href: `${location.pathname}/project`
                },
                {
                    label: 'Environment',
                    icon: 'cloud',
                    href: `${location.pathname}/environment`
                },
                {
                    label: 'Goals',
                    icon: 'target',
                    href: `${location.pathname}/goals`
                },
                {
                    label: 'System',
                    icon: 'cpu',
                    href: `${location.pathname}/system`
                }
            ])
        );
    }

    override presentList(): void { }
}