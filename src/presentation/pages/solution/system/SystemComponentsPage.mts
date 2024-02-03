import type Component from '~/domain/Component.mjs';
import _SystemPage from './_SystemPage.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import type System from '~/domain/System.mjs';
import html from '~/presentation/lib/html.mjs';

const { p } = html;

export default class SystemComponentsPage extends _SystemPage {
    static override route = '/:solution/system/components';
    static {
        customElements.define('x-page-system-components', this);
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
                systemId: this.systemId,
                name,
                description,
                interfaceDefinition
            });
            await this.interactor.presentItem(this.systemId);
        },
        onUpdate: async component => {
            await this.interactor.updateComponent({
                systemId: this.systemId,
                component
            });
            await this.interactor.presentItem(this.systemId);
        },
        onDelete: async id => {
            await this.interactor.deleteComponent({
                systemId: this.systemId,
                id
            });
            await this.interactor.presentItem(this.systemId);
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

    override presentItem(system: System) {
        this.#dataTable.presentList(system.components);
    }
}