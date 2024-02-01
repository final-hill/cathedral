import Constraint, { ConstraintCategory } from '~/domain/Constraint.mjs';
import { DataTable } from '~components/index.mjs';
import html from '~/presentation/lib/html.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';
import type Environment from '~/domain/Environment.mjs';

const { p } = html;

export default class ConstraintsPage extends _EnvironmentPage {
    static override route = '/:solution/environment/constraints';
    static {
        customElements.define('x-page-constraints', this);
    }

    #dataTable = new DataTable<Constraint>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            statement: { headerText: 'Statement', required: true, formType: 'text', unique: true },
            category: {
                headerText: 'Category', formType: 'select',
                options: Object.values(ConstraintCategory).map(x => ({ value: x, text: x }))
            }
        },
        onCreate: async item => {
            await this.interactor.createConstraint({
                ...item,
                environmentId: this.environmentId
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onUpdate: async constraint => {
            await this.interactor.updateConstraint({
                constraint,
                environmentId: this.environmentId
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onDelete: async id => {
            await this.interactor.deleteConstraint({
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
                Environmental constraints are the limitations and obligations that
                the environment imposes on the project and system.
            `),
            this.#dataTable
        );
    }

    override presentItem(environment: Environment) {
        this.#dataTable.presentList(environment.constraints);
    }
}