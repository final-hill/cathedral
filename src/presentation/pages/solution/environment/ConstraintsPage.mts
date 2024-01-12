import type { Uuid } from '~/types/Uuid.mjs';
import type Environment from '~/domain/Environment.mjs';
import Constraint, { ConstraintCategory } from '~/domain/Constraint.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import ConstraintRepository from '~/data/ConstraintRepository.mjs';
import Page from '~/presentation/pages/Page.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import html from '~/presentation/lib/html.mjs';

const { p } = html;

export default class ConstraintsPage extends Page {
    static override route = '/:solution/environment/constraints';
    static {
        customElements.define('x-page-constraints', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #environmentRepository = new EnvironmentRepository(localStorage);
    #constraintRepository = new ConstraintRepository(localStorage);
    #environment?: Environment;

    constructor() {
        super({ title: 'Constraints' }, []);

        const dataTable = new DataTable<Constraint>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
                statement: { headerText: 'Statement', required: true, formType: 'text', unique: true },
                category: {
                    headerText: 'Category', formType: 'select',
                    options: Object.values(ConstraintCategory).map(x => ({ value: x, text: x }))
                }
            },
            select: async () => {
                if (!this.#environment)
                    return [];

                return await this.#constraintRepository.getAll(t => this.#environment!.constraintIds.includes(t.id));
            },
            onCreate: async item => {
                const constraint = new Constraint({ ...item, id: self.crypto.randomUUID() });
                this.#environment!.constraintIds.push(constraint.id);
                await Promise.all([
                    this.#constraintRepository.add(constraint),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            },
            onUpdate: async item => {
                await this.#constraintRepository.update(new Constraint({
                    ...item
                }));
            },
            onDelete: async id => {
                this.#environment!.constraintIds = this.#environment!.constraintIds.filter(x => x !== id);
                await Promise.all([
                    this.#constraintRepository.delete(id),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            }
        });

        this.append(
            p(`
                Environmental constraints are the limitations and obligations that
                the environment imposes on the project and system.
            `),
            dataTable
        );

        this.#environmentRepository.addEventListener('update', () => dataTable.renderData());
        this.#constraintRepository.addEventListener('update', () => dataTable.renderData());
        const solutionId = this.urlParams['solution'] as Uuid;
        this.#solutionRepository.getBySlug(solutionId).then(solution => {
            this.#environmentRepository.get(solution!.environmentId).then(environment => {
                this.#environment = environment;
                dataTable.renderData();
            });
        });
    }
}