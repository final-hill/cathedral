import type Goals from '~/domain/Goals.mjs';
import Stakeholder, { StakeholderCategory, StakeholderSegmentation } from '~/domain/Stakeholder.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import StakeholderRepository from '~/data/StakeholderRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import { SlugPage } from '../SlugPage.mjs';
import { Tabs } from '~components/Tabs.mjs';
import mermaid from 'mermaid';
import groupBy from '~/lib/groupBy.mjs';

const { h2, p, div } = html;

export class Stakeholders extends SlugPage {
    static {
        customElements.define('x-stakeholders-page', this);
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark'
        });
    }

    #goalsRepository = new GoalsRepository();
    #stakeholderRepository = new StakeholderRepository();
    #goals?: Goals;

    constructor() {
        super({ title: 'Stakeholders' }, []);

        const dataTable = new DataTable<Stakeholder>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                name: { headerText: 'Name', required: true, formType: 'text' },
                description: { headerText: 'Description', required: true, formType: 'text' },
                segmentation: {
                    headerText: 'Segmentation', formType: 'select',
                    options: Object.values(StakeholderSegmentation).map(x => ({ value: x, text: x }))
                },
                influence: { headerText: 'Influence', formType: 'range', min: 0, max: 100, step: 1 },
                availability: { headerText: 'Availability', formType: 'range', min: 0, max: 100, step: 1 },
            },
            select: async () => {
                if (!this.#goals)
                    return [];

                return await this.#stakeholderRepository.getAll(s => this.#goals!.stakeholders.includes(s.id));
            },
            onCreate: async item => {
                const stakeholder = new Stakeholder({ ...item, id: self.crypto.randomUUID() });
                await this.#stakeholderRepository.add(stakeholder);
                this.#goals!.stakeholders.push(stakeholder.id);
                await this.#goalsRepository.update(this.#goals!);
            },
            onUpdate: async item => {
                await this.#stakeholderRepository.update(new Stakeholder({
                    ...item
                }));
            },
            onDelete: async id => {
                await this.#stakeholderRepository.delete(id);
                this.#goals!.stakeholders = this.#goals!.stakeholders.filter(x => x !== id);
                await this.#goalsRepository.update(this.#goals!);
            }
        });

        dataTable.slot = 'content';

        this.append(
            p(`
            Stakeholders are the categories of people who are affected by the
            problem you are trying to solve. Do not list individuals, but rather
            groups or roles. Example: instead of "Jane Doe", use "Project Manager".
        `),
            new Tabs({ selectedIndex: 0 }, [
                h2({ slot: 'tab' }, 'Stakeholders'),
                dataTable,
                h2({ slot: 'tab' }, 'Stakeholder Map'),
                div({ id: 'mermaid-container', slot: 'content' }, []),
            ])
        );

        this.#goalsRepository.addEventListener('update', () => {
            dataTable.renderData();
            this.#renderStakeholderMap();
        });
        this.#stakeholderRepository.addEventListener('update', () => {
            dataTable.renderData();
            this.#renderStakeholderMap();
        });
        this.#goalsRepository.getBySlug(this.slug).then(async goals => {
            this.#goals = goals;
            dataTable.renderData();
            this.#renderStakeholderMap();
        });
    }

    async #renderStakeholderMap() {
        const mermaidContainer = this.querySelector('#mermaid-container')!,
            // TODO: waiting for Object.groupBy to be implemented in TS:
            // <https://github.com/microsoft/TypeScript/issues/47171>
            stakeholders = groupBy(
                await this.#stakeholderRepository.getAll(),
                ({ segmentation }) => segmentation
            ),
            clientGroup = stakeholders[StakeholderSegmentation.Client] ?? [],
            vendorGroup = stakeholders[StakeholderSegmentation.Vendor] ?? [],
            chartDefinition = (stakeholders: Stakeholder[], category: StakeholderSegmentation) => `
                quadrantChart
                title ${category}
                x-axis Low Availability --> High Availability
                y-axis Low Infuence --> High Influence
                quadrant-1 "${StakeholderCategory.KeyStakeholder} (Satisfy)"
                quadrant-2 "${StakeholderCategory.ShadowInfluencer} (Manage)"
                quadrant-3 "${StakeholderCategory.Observer} (Inform)"
                quadrant-4 "${StakeholderCategory.FellowTraveler} (Monitor)"
                ${stakeholders.map(({ name, availability, influence }) =>
                `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
                }
            `,
            { svg: svgClient } = await mermaid.render('clientMap', chartDefinition(clientGroup, StakeholderSegmentation.Client)),
            { svg: svgVendor } = await mermaid.render('vendorMap', chartDefinition(vendorGroup, StakeholderSegmentation.Vendor));
        mermaidContainer.innerHTML = `${svgClient}<br>${svgVendor}`;
    }
}