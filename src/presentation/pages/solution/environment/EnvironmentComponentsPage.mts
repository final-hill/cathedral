import Component from '~/domain/Component.mjs';
import { DataTable } from '~components/index.mjs';
import html from '~/presentation/lib/html.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';
import type Environment from '~/domain/Environment.mjs';

const { p } = html;

export default class EnvironmentComponentsPage extends _EnvironmentPage {
    static override route = '/:solution/environment/components';
    static {
        customElements.define('x-page-environment-components', this);
    }

    #dataTable = new DataTable<Component>({
        columns: {
            id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
            name: { headerText: 'Name', required: true, formType: 'text', unique: true },
            description: { headerText: 'Description', formType: 'text' },
            interfaceDefinition: { headerText: 'Interface Definition', formType: 'textarea' }
        },
        onCreate: async ({ name, description, interfaceDefinition }) => {
            await this.interactor.createComponent({
                environmentId: this.environmentId,
                name,
                description,
                interfaceDefinition
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onUpdate: async component => {
            await this.interactor.updateComponent({
                environmentId: this.environmentId,
                component
            });
            await this.interactor.presentItem(this.environmentId);
        },
        onDelete: async id => {
            await this.interactor.deleteComponent({
                environmentId: this.environmentId,
                id
            });
            await this.interactor.presentItem(this.environmentId);
        }
    });

    constructor() {
        super({ title: 'Components' });

        this.append(
            p(`
                Components are self-contained elements in the Environment that provide
                an interface which can be used by a System to interact with.
            `),
            this.#dataTable
        );
    }

    override presentItem(environment: Environment) {
        this.#dataTable.presentList(environment.components);
    }
}