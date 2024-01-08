import { MiniCards, MiniCard } from '~/presentation/components/index.mjs';
import Page from '../Page.mjs';

export default class EnvironmentPage extends Page {
    static override route = '/environments/:slug';
    static {
        customElements.define('x-environment-page', this);
    }

    constructor() {
        super({ title: 'Environment' }, [
            new MiniCards({}, [
                new MiniCard({
                    title: 'Glossary',
                    icon: 'list',
                    href: `${location.pathname}/glossary`
                }),
            ])
        ]);
    }
}