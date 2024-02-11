import { Behavior, type Goals } from '~/domain/index.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~components/index.mjs';
import _GoalsPage from './_GoalsPage.mjs';

const { p, strong } = html;

export default class FunctionalityPage extends _GoalsPage {
    static override route = '/:solution/goals/functionality';
    static {
        customElements.define('x-page-functionality', this);
    }

    #dataTable = new DataTable<Behavior>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
        },
        onCreate: async item => {
            await this.interactor.createBehavior({
                goalsId: this.goalsId,
                statement: item.statement
            });
            await this.interactor.presentItem(this.goalsId);
        },
        onUpdate: async item => {
            await this.interactor.updateBehavior({
                goalsId: this.goalsId,
                behavior: item
            });
            await this.interactor.presentItem(this.goalsId);
        },
        onDelete: async id => {
            await this.interactor.deleteBehavior({
                goalsId: this.goalsId,
                id
            });
            await this.interactor.presentItem(this.goalsId);
        }
    });

    constructor() {
        super({ title: 'Functionality' });

        this.append(
            p([
                `This section describes the high - level functional behaviors of a system.
                 Specify what results or effects are expected. Describe `,
                strong('what'), ' the system should do, not ', strong('how'),
                ' it should do it.'
            ]),
            this.#dataTable
        );
    }

    override presentItem(goals: Goals) {
        this.#dataTable.presentList(goals.functionalBehaviors);
    }
}