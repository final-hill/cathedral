import Assumption from '~/domain/Assumption.mjs';
import { DataTable } from '~components/index.mjs';
import html from '~/presentation/lib/html.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';
import type Environment from '~/domain/Environment.mjs';

const { p } = html;

export default class AssumptionPage extends _EnvironmentPage {
    static override route = '/:solution/environment/assumptions';
    static {
        customElements.define('x-page-assumptions', this);
    }

    #dataTable = new DataTable<Assumption>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
        },
        onCreate: async ({ statement }) => {
            await this.interactor.createAssumption({
                environmentId: this.environmentId,
                statement
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onUpdate: async assumption => {
            await this.interactor.updateAssumption({
                environmentId: this.environmentId,
                assumption
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onDelete: async id => {
            await this.interactor.deleteAssumption({
                environmentId: this.environmentId,
                id
            });
            await this.interactor.presentItem(this.environmentId);
        }
    });

    constructor() {
        super({ title: 'Assumptions' });

        this.append(
            p(`
                An assumption is a property of the environment that is assumed to be true.
                Assumptions are used to simplify the problem and to make it more tractable.
                An example of an assumption would be: "Screen resolution will not change during the execution of the program".
            `),
            this.#dataTable
        );
    }

    override presentItem(environment: Environment) {
        this.#dataTable.presentList(environment.assumptions);
    }
}