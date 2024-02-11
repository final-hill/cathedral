import { Stakeholder, StakeholderSegmentation, Goals } from '~/domain/index.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable, Tabs, StakeholdersMap } from '~components/index.mjs';
import _GoalsPage from './_GoalsPage.mjs';

const { h2, p } = html;

export default class StakeholdersPage extends _GoalsPage {
    static override route = '/:solution/goals/stakeholders';
    static {
        customElements.define('x-page-stakeholders', this);
    }

    #dataTable; #stakeholdersMap;

    constructor() {
        super({ title: 'Stakeholders' });

        this.append(
            p(`
            Stakeholders are the categories of people who are affected by the
            problem you are trying to solve. Do not list individuals, but rather
            groups or roles. Example: instead of "Jane Doe", use "Project Manager".
        `),
            new Tabs({ selectedIndex: 0 }, [
                h2({ slot: 'tab' }, 'Stakeholders'),
                this.#dataTable = new DataTable<Stakeholder>({
                    slot: 'content',
                    columns: {
                        id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                        name: { headerText: 'Name', required: true, formType: 'text' },
                        description: { headerText: 'Description', required: true, formType: 'text' },
                        segmentation: {
                            headerText: 'Segmentation', formType: 'select',
                            options: Object.values(StakeholderSegmentation).map(x => ({ value: x, text: x }))
                        },
                        influence: { headerText: 'Influence', formType: 'range', min: 0, max: 100, step: 1 },
                        availability: { headerText: 'Availability', formType: 'range', min: 0, max: 100, step: 1 },
                    },
                    onCreate: async item => {
                        await this.interactor.createStakeholder({
                            goalsId: this.goalsId,
                            stakeholder: item
                        });
                        await this.interactor.presentItem(this.goalsId);
                    },
                    onUpdate: async stakeholder => {
                        await this.interactor.updateStakeholder({
                            goalsId: this.goalsId,
                            stakeholder
                        });
                        await this.interactor.presentItem(this.goalsId);
                    },
                    onDelete: async id => {
                        await this.interactor.deleteStakeholder({
                            goalsId: this.goalsId,
                            id
                        });
                        await this.interactor.presentItem(this.goalsId);
                    }
                }),
                h2({ slot: 'tab' }, 'Stakeholder Map'),
                this.#stakeholdersMap = new StakeholdersMap({
                    slot: 'content'
                })
            ])
        );
    }

    override async presentItem(goals: Goals) {
        await this.#dataTable.presentList(goals.stakeholders);
        await this.#stakeholdersMap.presentList(goals.stakeholders);
    }
}