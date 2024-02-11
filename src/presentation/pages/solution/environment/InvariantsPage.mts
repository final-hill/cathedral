import { type Environment, Invariant } from '~/domain/index.mjs';
import { DataTable } from '~components/DataTable.mjs';
import html from '~/presentation/lib/html.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';

const { p } = html;

export default class InvariantsPage extends _EnvironmentPage {
    static override route = '/:solution/environment/invariants';
    static {
        customElements.define('x-page-invariants', this);
    }

    #dataTable = new DataTable<Invariant>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
        },
        onCreate: async item => {
            await this.interactor.createInvariant({
                ...item,
                environmentId: this.environmentId
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onUpdate: async invariant => {
            await this.interactor.updateInvariant({
                environmentId: this.environmentId,
                invariant
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onDelete: async id => {
            await this.interactor.deleteInvariant({
                environmentId: this.environmentId,
                id
            });
            await this.interactor.presentItem(this.environmentId);
        }
    });

    constructor() {
        super({ title: 'Constraints' });

        this.append(
            p(`
                Invariants are properties that must always be true. They are used to
                constrain the possible states of a system.
            `),
            this.#dataTable
        );
    }

    override async presentItem(environment: Environment) {
        this.#dataTable.presentList(environment.invariants);
    }
}