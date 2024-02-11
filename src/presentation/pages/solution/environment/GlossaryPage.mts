import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~components/index.mjs';
import { GlossaryTerm, type Environment } from '~/domain/index.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';

const { p } = html;

export default class GlossaryPage extends _EnvironmentPage {
    static override route = '/:solution/environment/glossary';
    static {
        customElements.define('x-page-glossary', this);
    }

    #dataTable = new DataTable<GlossaryTerm>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            term: { headerText: 'Term', required: true, formType: 'text', unique: true },
            definition: { headerText: 'Definition', formType: 'text' }
        },
        onCreate: async glossaryTerm => {
            await this.interactor.createGlossaryTerm({
                ...glossaryTerm,
                environmentId: this.environmentId
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onUpdate: async glossaryTerm => {
            await this.interactor.updateGlossaryTerm({
                environmentId: this.environmentId,
                glossaryTerm
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onDelete: async id => {
            await this.interactor.deleteGlossaryTerm({
                environmentId: this.environmentId,
                id
            });
            await this.interactor.presentItem(this.environmentId);
        }
    });

    constructor() {
        super({ title: 'Glossary' });

        this.append(
            p(`
                This section defines the terms used in the context of this environment.
                Specify the terms and their definitions.
            `),
            this.#dataTable
        );
    }

    override async presentItem(environment: Environment) {
        this.#dataTable.presentList(environment.glossaryTerms);
    }
}