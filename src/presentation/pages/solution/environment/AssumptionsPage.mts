import type { Uuid } from '~/types/Uuid.mjs';
import type Environment from '~/domain/Environment.mjs';
import Assumption from '~/domain/Assumption.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import AssumptionRepository from '~/data/AssumptionRepository.mjs';
import Page from '~/presentation/pages/Page.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import html from '~/presentation/lib/html.mjs';

const { p } = html;

export default class AssumptionPage extends Page {
    static override route = '/:solution/environment/assumptions';
    static {
        customElements.define('x-page-assumtptions', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #environmentRepository = new EnvironmentRepository(localStorage);
    #assumptionRepository = new AssumptionRepository(localStorage);
    #environment?: Environment;

    constructor() {
        super({ title: 'Assumptions' }, []);

        const dataTable = new DataTable<Assumption>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
                statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
            },
            select: async () => {
                if (!this.#environment)
                    return [];

                return await this.#assumptionRepository.getAll(t => this.#environment!.assumptionIds.includes(t.id));
            },
            onCreate: async item => {
                const assumption = new Assumption({ ...item, id: self.crypto.randomUUID() });
                this.#environment!.assumptionIds.push(assumption.id);
                await Promise.all([
                    this.#assumptionRepository.add(assumption),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            },
            onUpdate: async item => {
                await this.#assumptionRepository.update(new Assumption({
                    ...item
                }));
            },
            onDelete: async id => {
                this.#environment!.assumptionIds = this.#environment!.assumptionIds.filter(x => x !== id);
                await Promise.all([
                    this.#assumptionRepository.delete(id),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            }
        });

        this.append(
            p(`
                An assumption is a property of the environment that is assumed to be true.
                Assumptions are used to simplify the problem and to make it more tractable.
                An example of an assumption would be: "Screen resolution will not change during the execution of the program".
            `),
            dataTable
        );

        this.#environmentRepository.addEventListener('update', () => dataTable.renderData());
        this.#assumptionRepository.addEventListener('update', () => dataTable.renderData());
        const solutionId = this.urlParams['solution'] as Uuid;
        this.#solutionRepository.getBySlug(solutionId).then(solution => {
            this.#environmentRepository.get(solution!.environmentId).then(environment => {
                this.#environment = environment;
                dataTable.renderData();
            });
        });
    }
}