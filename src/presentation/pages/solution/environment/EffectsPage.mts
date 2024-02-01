import Effect from '~/domain/Effect.mjs';
import { DataTable } from '~components/index.mjs';
import html from '~/presentation/lib/html.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';
import type Environment from '~/domain/Environment.mjs';

const { p } = html;

export default class EffectsPage extends _EnvironmentPage {
    static override route = '/:solution/environment/effects';
    static {
        customElements.define('x-page-effects', this);
    }

    #dataTable = new DataTable<Effect>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
        },
        onCreate: async item => {
            await this.interactor.createEffect({
                ...item,
                environmentId: this.environmentId
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onUpdate: async effect => {
            await this.interactor.updateEffect({
                environmentId: this.environmentId,
                effect
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onDelete: async id => {
            await this.interactor.deleteEffect({
                environmentId: this.environmentId,
                id
            });
            await this.interactor.presentItem(this.environmentId);
        }
    });

    constructor() {
        super({ title: 'Effects' });

        this.append(
            p(`
                An Effect is an environment property affected by a System.
                Example: "The running system will cause the temperature of the room to increase."
            `),
            this.#dataTable
        );
    }

    override presentItem(environment: Environment) {
        this.#dataTable.presentList(environment.effects);
    }
}