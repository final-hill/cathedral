import type { Uuid } from '~/types/Uuid.mjs';
import type Environment from '~/domain/Environment.mjs';
import Invariant from '~/domain/Invariant.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import InvariantRepository from '~/data/InvariantRepository.mjs';
import Page from '~/presentation/pages/Page.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import html from '~/presentation/lib/html.mjs';

const { p } = html;

export default class InvariantsPage extends Page {
    static override route = '/:solution/environment/invariants';
    static {
        customElements.define('x-page-invariants', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #environmentRepository = new EnvironmentRepository(localStorage);
    #invariantRepository = new InvariantRepository(localStorage);
    #environment?: Environment;

    constructor() {
        super({ title: 'Constraints' }, []);

        const dataTable = new DataTable<Invariant>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
                statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
            },
            select: async () => {
                if (!this.#environment)
                    return [];

                return await this.#invariantRepository.getAll(t => this.#environment!.invariantIds.includes(t.id));
            },
            onCreate: async item => {
                const invariant = new Invariant({ ...item, id: self.crypto.randomUUID() });
                this.#environment!.invariantIds.push(invariant.id);
                await Promise.all([
                    this.#invariantRepository.add(invariant),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            },
            onUpdate: async item => {
                await this.#invariantRepository.update(new Invariant({
                    ...item
                }));
            },
            onDelete: async id => {
                this.#environment!.invariantIds = this.#environment!.invariantIds.filter(x => x !== id);
                await Promise.all([
                    this.#invariantRepository.delete(id),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            }
        });

        this.append(
            p(`
                Invariants are properties that must always be true. They are used to
                constrain the possible states of a system.
            `),
            dataTable
        );

        this.#environmentRepository.addEventListener('update', () => dataTable.renderData());
        this.#invariantRepository.addEventListener('update', () => dataTable.renderData());
        const solutionId = this.urlParams['solution'] as Uuid;
        this.#solutionRepository.getBySlug(solutionId).then(solution => {
            this.#environmentRepository.get(solution!.environmentId).then(environment => {
                this.#environment = environment;
                dataTable.renderData();
            });
        });
    }
}