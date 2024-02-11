import { Component, type Environment } from '~/domain/index.mjs';
import html from '~/presentation/lib/html.mjs';
import _EnvironmentPage from './_EnvironmentPage.mjs';
import { TreeView } from '~/presentation/components/TreeView.mjs';

const { p } = html;

export default class EnvironmentComponentsPage extends _EnvironmentPage {
    static override route = '/:solution/environment/components';
    static {
        customElements.define('x-page-environment-components', this);
    }

    #treeView = new TreeView<Component>({
        labelField: 'name',
        onCreate: async ({ label, parentId }) =>
            await this.interactor.createComponent({
                environmentId: this.environmentId,
                parentId,
                label
            }),
        onUpdate: async ({ id, label, parentId }) =>
            await this.interactor.updateComponent({
                environmentId: this.environmentId,
                id,
                parentId,
                label
            }),
        onDelete: async ({ id, parentId }) =>
            await this.interactor.deleteComponent({
                environmentId: this.environmentId,
                id,
                parentId
            })
    });

    constructor() {
        super({ title: 'Components' });

        this.append(
            p(`
                Components are self-contained elements in the Environment that provide
                an interface which can be used by a System to interact with. A component
                can be composed of other components, forming a tree structure.
            `),
            this.#treeView
        );
    }

    override presentItem(environment: Environment) {
        this.#treeView.presentList(environment.components);
    }
}