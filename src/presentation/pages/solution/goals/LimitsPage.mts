import Limit from '~/domain/Limit.mjs';
import type Goals from '~/domain/Goals.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~components/index.mjs';
import _GoalsPage from './_GoalsPage.mjs';

const { p } = html;

export default class LimitsPage extends _GoalsPage {
    static override route = '/:solution/goals/limitations';
    static {
        customElements.define('x-page-limitations', this);
    }

    #dataTable = new DataTable<Limit>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
        },
        onCreate: async item => {
            await this.interactor.createLimit({
                goalsId: this.goalsId,
                statement: item.statement
            });
            await this.interactor.presentItem(this.goalsId);
        },
        onUpdate: async item => {
            await this.interactor.updateLimit({
                goalsId: this.goalsId,
                limit: item
            });
            await this.interactor.presentItem(this.goalsId);
        },
        onDelete: async id => {
            await this.interactor.deleteLimit({
                goalsId: this.goalsId,
                id
            });
            await this.interactor.presentItem(this.goalsId);
        }
    });

    constructor() {
        super({ title: 'Limitations' });

        this.append(
            p([
                `Limitations are the constraints on functionality.
                They describe What that is out-of-scope and excluded.
                Example: "Providing an interface to the user to change
                the color of the background is out-of-scope."
                `
            ]),
            this.#dataTable
        );
    }

    override presentItem(goals: Goals) {
        this.#dataTable.presentList(goals.limits);
    }
}