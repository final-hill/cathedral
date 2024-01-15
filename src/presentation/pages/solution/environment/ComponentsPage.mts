import type { Uuid } from '~/types/Uuid.mjs';
import type Environment from '~/domain/Environment.mjs';
import Component from '~/domain/Component.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import ComponentRepository from '~/data/ComponentRepository.mjs';
import Page from '~/presentation/pages/Page.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import html from '~/presentation/lib/html.mjs';

const { p } = html;

export default class ComponentsPage extends Page {
    static override route = '/:solution/environment/components';
    static {
        customElements.define('x-page-components', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #environmentRepository = new EnvironmentRepository(localStorage);
    #componentRepository = new ComponentRepository(localStorage);
    #environment?: Environment;

    constructor() {
        super({ title: 'Components' }, []);

        const dataTable = new DataTable<Component>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden', unique: true },
                name: { headerText: 'Name', required: true, formType: 'text', unique: true },
                description: { headerText: 'Description', formType: 'text' },
                interfaceDefinition: { headerText: 'Interface Definition', formType: 'textarea' }
            },
            select: async () => {
                if (!this.#environment)
                    return [];

                return await this.#componentRepository.getAll(t => this.#environment!.componentIds.includes(t.id));
            },
            onCreate: async item => {
                const component = new Component({
                    id: self.crypto.randomUUID(),
                    name: item.name,
                    description: item.description,
                    statement: item.interfaceDefinition
                });
                this.#environment!.componentIds.push(component.id);
                await Promise.all([
                    this.#componentRepository.add(component),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            },
            onUpdate: async item => {
                await this.#componentRepository.update(new Component({
                    ...item
                }));
            },
            onDelete: async id => {
                this.#environment!.componentIds = this.#environment!.componentIds.filter(x => x !== id);
                await Promise.all([
                    this.#componentRepository.delete(id),
                    this.#environmentRepository.update(this.#environment!)
                ]);
            }
        });

        this.append(
            p(`
                Components are self-contained elements in the Environment that provide
                an interface which can be used by a System to interact with.
            `),
            dataTable
        );

        this.#environmentRepository.addEventListener('update', () => dataTable.renderData());
        this.#componentRepository.addEventListener('update', () => dataTable.renderData());
        const solutionId = this.urlParams['solution'] as Uuid;
        this.#solutionRepository.getBySlug(solutionId).then(solution => {
            this.#environmentRepository.get(solution!.environmentId).then(environment => {
                this.#environment = environment;
                dataTable.renderData();
            });
        });
    }
}