import { type Component, type System } from '~/domain/index.mjs';
import _SystemPage from './_SystemPage.mjs';
import html from '~/presentation/lib/html.mjs';
import { TreeView } from '~/presentation/components/TreeView.mjs';

const { p } = html;

export default class SystemComponentsPage extends _SystemPage {
    static override route = '/:solution/system/components';
    static {
        customElements.define('x-page-system-components', this);
    }

    #treeView = new TreeView<Component>({
        labelField: 'name',
        onCreate: async ({ label, parentId }) =>
            await this.interactor.createComponent({
                systemId: this.systemId,
                parentId,
                label
            }),
        onUpdate: async ({ id, label, parentId }) =>
            await this.interactor.updateComponent({
                systemId: this.systemId,
                id,
                parentId,
                label
            }),
        onDelete: async ({ id, parentId }) =>
            await this.interactor.deleteComponent({
                systemId: this.systemId,
                id,
                parentId
            })
    });

    constructor() {
        super({ title: 'Components' });

        this.append(
            p(`
                Components are self-contained elements in the Environment that provide
                an interface which can be used by a System to interact with.
            `),
            this.#treeView
        );
    }

    override presentItem(system: System) {
        this.#treeView.presentList(system.components);
    }
}