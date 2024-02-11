import html from '~/presentation/lib/html.mjs';
import _SystemPage from './_SystemPage.mjs';
import { MiniCards } from '~components/MiniCards.mjs';
import { type System } from '~/domain/index.mjs';

const { p } = html;

export default class SystemIndexPage extends _SystemPage {
    static override route = '/:solution/system';
    static {
        customElements.define('x-page-system-index', this);
    }

    constructor() {
        super({ title: 'System' });

        this.append(
            p(`A System is a set of related artifacts that work together to
            accomplish a common goal. Systems can be physical or software.`),
            new MiniCards({}, [
                {
                    label: 'Components',
                    icon: 'box',
                    href: `${location.pathname}/components`
                }
            ])
        );
    }

    override presentItem(_entity: System) { }

    override presentList(_entities: System[]) { }
}