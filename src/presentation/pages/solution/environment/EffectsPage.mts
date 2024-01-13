import type { Uuid } from '~/types/Uuid.mjs';
import type Environment from '~/domain/Environment.mjs';
import Effect from '~/domain/Effect.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import EffectRepository from '~/data/EffectRepository.mjs';
import Page from '~/presentation/pages/Page.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import html from '~/presentation/lib/html.mjs';

const { p } = html;

export default class EffectsPage extends Page {
    static override route = '/:solution/environment/effects';
    static {
        customElements.define('x-page-effects', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #environmentRepository = new EnvironmentRepository(localStorage);
    #effectRepository = new EffectRepository(localStorage);
    #environment?: Environment;

    constructor() {
        super({ title: 'Effects' }, []);

        const dataTable = new DataTable<Effect>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
                statement: { headerText: 'Statement', required: true, formType: 'text', unique: true }
            },
            select: async () => {
                if (!this.#environment)
                    return [];

                return await this.#effectRepository.getAll(t => this.#environment!.effectIds.includes(t.id));
            },
            onCreate: async item => {
                const effect = new Effect({ ...item, id: self.crypto.randomUUID() });
                this.#environment!.effectIds.push(effect.id);
                await Promise.all([
                    this.#effectRepository.add(effect),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            },
            onUpdate: async item => {
                await this.#effectRepository.update(new Effect({
                    ...item
                }));
            },
            onDelete: async id => {
                this.#environment!.effectIds = this.#environment!.effectIds.filter(x => x !== id);
                await Promise.all([
                    this.#effectRepository.delete(id),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            }
        });

        this.append(
            p(`
                An Effect is an environment property affected by a System.
                Example: "The running system will cause the temperature of the room to increase."
            `),
            dataTable
        );

        this.#environmentRepository.addEventListener('update', () => dataTable.renderData());
        this.#effectRepository.addEventListener('update', () => dataTable.renderData());
        const solutionId = this.urlParams['solution'] as Uuid;
        this.#solutionRepository.getBySlug(solutionId).then(solution => {
            this.#environmentRepository.get(solution!.environmentId).then(environment => {
                this.#environment = environment;
                dataTable.renderData();
            });
        });
    }
}