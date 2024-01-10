import Behavior from '~/domain/Behavior.mjs';
import type Goals from '~/domain/Goals.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import BehaviorRepository from '~/data/BehaviorRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import Page from '~/presentation/pages/Page.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';

const { p, strong } = html;

export default class FunctionalityPage extends Page {
    static override route = '/:solution/goals/functionality';
    static {
        customElements.define('x-page-functionality', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #goalsRepository = new GoalsRepository(localStorage);
    #behaviorRepository = new BehaviorRepository(localStorage);
    #goals?: Goals;

    constructor() {
        super({ title: 'Functionality' }, [
            p([
                `This section describes the high - level functional behaviors of a system.
                Specify what results or effects are expected. Describe `,
                strong('what'), ' the system should do, not ', strong('how'), ' it should do it.'
            ])
        ]);

        const dataTable = new DataTable({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                statement: { headerText: 'Statement', required: true, formType: 'text' }
            },
            select: async () => {
                if (!this.#goals)
                    return [];

                return await this.#behaviorRepository.getAll(b => this.#goals!.functionalBehaviorIds.includes(b.id));
            },
            onCreate: async item => {
                const behavior = new Behavior({ ...item, id: self.crypto.randomUUID() });
                await this.#behaviorRepository.add(behavior);
                this.#goals!.functionalBehaviorIds.push(behavior.id);
                await this.#goalsRepository.update(this.#goals!);
            },
            onUpdate: async item => {
                const behavior = (await this.#behaviorRepository.get(item.id))!;
                behavior.statement = item.statement;
                await this.#behaviorRepository.update(behavior);
            },
            onDelete: async id => {
                await this.#behaviorRepository.delete(id);
                this.#goals!.functionalBehaviorIds = this.#goals!.functionalBehaviorIds.filter(x => x !== id);
                await this.#goalsRepository.update(this.#goals!);
            }
        });
        this.append(dataTable);

        this.#goalsRepository.addEventListener('update', () => dataTable.renderData());
        this.#behaviorRepository.addEventListener('update', () => dataTable.renderData());
        const solutionSlug = this.urlParams['solution'];
        this.#solutionRepository.getBySlug(solutionSlug).then(solution => {
            this.#goalsRepository.get(solution!.goalsId).then(goals => {
                this.#goals = goals;
                dataTable.renderData();
            });
        });
    }
}