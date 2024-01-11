import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import GlossaryTerm from '~/domain/GlossaryTerm.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import GlossaryRepository from '~/data/GlossaryRepository.mjs';
import type Environment from '~/domain/Environment.mjs';
import Page from '~/presentation/pages/Page.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import type { Uuid } from '~/types/Uuid.mjs';

const { p } = html;

export default class GlossaryPage extends Page {
    static override route = '/:solution/environment/glossary';
    static {
        customElements.define('x-page-glossary', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #environmentRepository = new EnvironmentRepository(localStorage);
    #glossaryRepository = new GlossaryRepository(localStorage);
    #environment?: Environment;

    constructor() {
        super({ title: 'Glossary' }, []);

        const dataTable = new DataTable<GlossaryTerm>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
                term: { headerText: 'Term', required: true, formType: 'text', unique: true },
                definition: { headerText: 'Definition', formType: 'text' }
            },
            select: async () => {
                if (!this.#environment)
                    return [];

                return await this.#glossaryRepository.getAll(t => this.#environment!.glossaryIds.includes(t.id));
            },
            onCreate: async item => {
                const term = new GlossaryTerm({ ...item, id: self.crypto.randomUUID() });
                await this.#glossaryRepository.add(term);
                this.#environment!.glossaryIds.push(term.id);
                await this.#environmentRepository.update(this.#environment!);
            },
            onUpdate: async item => {
                await this.#glossaryRepository.update(new GlossaryTerm({
                    ...item
                }));
            },
            onDelete: async id => {
                await this.#glossaryRepository.delete(id);
                this.#environment!.glossaryIds = this.#environment!.glossaryIds.filter(x => x !== id);
                await this.#environmentRepository.update(this.#environment!);
            }
        });
        this.append(
            p(`
                This section defines the terms used in the context of this environment.
                Specify the terms and their definitions.
            `),
            dataTable
        );

        this.#environmentRepository.addEventListener('update', () => dataTable.renderData());
        this.#glossaryRepository.addEventListener('update', () => dataTable.renderData());
        const solutionId = this.urlParams['solution'] as Uuid;
        this.#solutionRepository.getBySlug(solutionId).then(solution => {
            this.#environmentRepository.get(solution!.environmentId).then(environment => {
                this.#environment = environment;
                dataTable.renderData();
            });
        });
    }
}