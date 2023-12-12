import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import { SlugPage } from '../SlugPage.mjs';
import { GlossaryTerm } from '~/domain/GlossaryTerm.mjs';
import { EnvironmentRepository } from '~/data/EnvironmentRepository.mjs';
import { GlossaryRepository } from '~/data/GlossaryRepository.mjs';
import type { Environment } from '~/domain/Environment.mjs';

const { p } = html;

export class Glossary extends SlugPage {
    static {
        customElements.define('x-glossary-page', this);
    }

    #environmentRepository = new EnvironmentRepository();
    #glossaryRepository = new GlossaryRepository();
    #environment?: Environment;

    constructor() {
        super({ title: 'Glossary' }, []);

        const dataTable = new DataTable<GlossaryTerm>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                term: { headerText: 'Term', required: true },
                definition: { headerText: 'Definition' }
            },
            select: async () => {
                if (!this.#environment)
                    return [];

                return await this.#glossaryRepository.getAll(t => this.#environment!.glossary.includes(t.id));
            },
            onCreate: async item => {
                const term = new GlossaryTerm({ ...item, id: self.crypto.randomUUID() });
                await this.#glossaryRepository.add(term);
                this.#environment!.glossary.push(term.id);
                await this.#environmentRepository.update(this.#environment!);
            },
            onUpdate: async item => {
                await this.#glossaryRepository.update(new GlossaryTerm({
                    ...item
                }));
            },
            onDelete: async id => {
                await this.#glossaryRepository.delete(id);
                this.#environment!.glossary = this.#environment!.glossary.filter(x => x !== id);
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
        this.#environmentRepository.getBySlug(this.slug).then(environment => {
            this.#environment = environment;
            dataTable.renderData();
        });
    }
}