import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import Page from '../Page.mjs';
import { Tabs } from '~components/Tabs.mjs';
import mermaid from 'mermaid';
import UseCase from '~/domain/UseCase.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import StakeholderRepository from '~/data/StakeholderRepository.mjs';
import type Goals from '~/domain/Goals.mjs';
import Stakeholder from '~/domain/Stakeholder.mjs';
import UseCaseRepository from '~/data/UseCaseRepository.mjs';

const { h2, p, div, br } = html;

export default class UseCasesPage extends Page {
    static override route = '/goals/:slug/use-cases';
    static {
        customElements.define('x-use-cases-page', this);
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark'
        });
    }

    #goalsRepository = new GoalsRepository(localStorage);
    #stakeholderRepository = new StakeholderRepository(localStorage);
    #useCaseRepository = new UseCaseRepository(localStorage);
    #goals?: Goals;
    #stakeholders: Stakeholder[] = [];

    constructor() {
        super({ title: 'Use Cases' }, []);
    }

    async connectedCallback() {
        this.#stakeholders = await this.#stakeholderRepository.getAll();

        const dataTable = new DataTable<UseCase>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                actor: {
                    headerText: 'Actor', required: true, formType: 'select',
                    options: this.#stakeholders.map(x => ({ value: x.id, text: x.name }))
                },
                statement: { headerText: 'Use Case', required: true, formType: 'text' }
            },
            select: async () => {
                if (!this.#goals)
                    return [];

                return this.#useCaseRepository.getAll(u => this.#goals!.useCases.includes(u.id));
            },
            onCreate: async item => {
                const useCase = new UseCase({ ...item, id: self.crypto.randomUUID() });
                await this.#useCaseRepository.add(useCase);
                this.#goals!.useCases.push(useCase.id);
                await this.#goalsRepository.update(this.#goals!);
            },
            onUpdate: async item => {
                await this.#useCaseRepository.update(new UseCase({
                    ...item
                }));
            },
            onDelete: async id => {
                await this.#useCaseRepository.delete(id);
                this.#goals!.useCases = this.#goals!.useCases.filter(x => x !== id);
                await this.#goalsRepository.update(this.#goals!);
            }
        });

        dataTable.slot = 'content';

        const update = async () => {
            dataTable.renderData();
            this.#renderUseCaseDiagram();
        };

        this.#goalsRepository.addEventListener('update', update);
        this.#stakeholderRepository.addEventListener('update', update);
        this.#goalsRepository.getBySlug(this.urlParams['slug'])
            .then(goals => { this.#goals = goals; })
            .then(update);
        this.#useCaseRepository.addEventListener('update', update);

        this.replaceChildren(
            p([`
                A use case is a list of related steps that actors perform to achieve a goal
                or to complete a scenario. On this page, you can define the use cases that
                are associated with the goals of your system. The system itself is not
                mentioned here, only the actors and their associated use case. Example:`,
                br(),
                'Pilot -> Check schedule',
                br(),
                'Clerk -> Confirm booking'
            ]),
            new Tabs({ selectedIndex: 0 }, [
                h2({ slot: 'tab' }, 'Use Cases'),
                dataTable,
                h2({ slot: 'tab' }, 'Diagram'),
                div({ id: 'mermaid-container', slot: 'content' }, []),
            ])
        );
    }

    async #renderUseCaseDiagram() {
        const mermaidContainer = this.querySelector('#mermaid-container')!,
            useCases = await this.#useCaseRepository.getAll(u => this.#goals!.useCases.includes(u.id)),
            chartDefinition = `
            flowchart LR
            ${useCases.map(u => {
                const actor = this.#stakeholders.find(s => s.id === u.actor)!;

                return `${actor.id}("#128100;<br>${actor.name}") --> ${u.id}["${u.statement}"]`;
            }).join('\n')}
            `,
            { svg } = await mermaid.render('diagram', chartDefinition);

        mermaidContainer.innerHTML = svg;
    }
}