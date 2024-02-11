import html from '~/presentation/lib/html.mjs';
import { DataTable, type OptDataColumn, Tabs, UseCaseDiagram } from '~components/index.mjs';
import { UseCase, type Goals, type Uuid } from '~/domain/index.mjs';
import _GoalsPage from './_GoalsPage.mjs';

const { h2, p, br } = html;

export default class UseCasesPage extends _GoalsPage {
    static override route = '/:solution/goals/use-cases';
    static {
        customElements.define('x-page-use-cases', this);
    }

    #dataTable; #useCaseDiagram;

    constructor() {
        super({ title: 'Use Cases' });

        this.append(
            p([`
                A use case is a list of related steps that actors perform to achieve a goal
                or to complete a scenario. On this page, you can define the use cases that
                are associated with the goals of your system. The system itself is not
                mentioned here, only the actors and their associated use case. Example:`,
                br(),
                'Pilot -> Check schedule',
                br(),
                'Clerk -> Confirm booking'
            ]),
            new Tabs({ selectedIndex: 0 }, [
                h2({ slot: 'tab' }, 'Use Cases'),
                this.#dataTable = new DataTable<Omit<UseCase, 'actor'> & { actorId: Uuid }>({
                    slot: 'content',
                    columns: {
                        id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                        actorId: {
                            headerText: 'Actor', required: true, formType: 'select',
                            options: [] // computed in presentItem method
                        },
                        statement: { headerText: 'Use Case', required: true, formType: 'text' }
                    },
                    onCreate: async ({ actorId, statement }) => {
                        await this.interactor.createUseCase({
                            goalsId: this.goalsId,
                            actorId,
                            statement
                        });
                        await this.interactor.presentItem(this.goalsId);
                    },
                    onUpdate: async ({ id, actorId, statement }) => {
                        await this.interactor.updateUseCase({
                            goalsId: this.goalsId,
                            id,
                            actorId,
                            statement
                        });
                        await this.interactor.presentItem(this.goalsId);
                    },
                    onDelete: async id => {
                        await this.interactor.deleteUseCase({
                            goalsId: this.goalsId,
                            id
                        });
                        await this.interactor.presentItem(this.goalsId);
                    }
                }),
                h2({ slot: 'tab' }, 'Diagram'),
                this.#useCaseDiagram = new UseCaseDiagram({
                    slot: 'content'
                })
            ])
        );
    }

    override async presentItem(goals: Goals) {
        const actorColumn = this.#dataTable.columns.actorId! as OptDataColumn;
        actorColumn.options = goals.stakeholders.map(a => ({ value: a.id, text: a.name }));

        await this.#dataTable.presentList(goals.useCases.map(useCase => {
            // @ts-expect-error : hack to convert actor to actorId
            useCase.actorId = useCase.actor.id;

            return useCase as unknown as Omit<UseCase, 'actor'> & { actorId: Uuid };
        }));
        await this.#useCaseDiagram.presentList(goals.useCases);
    }
}