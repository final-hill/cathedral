import type Goals from '~/domain/Goals.mjs';
import Stakeholder, { StakeholderCategory, StakeholderSegmentation } from '~/domain/Stakeholder.mjs';
import { GoalsRepository } from '~/data/GoalsRepository.mjs';
import { StakeholderRepository } from '~/data/StakeholderRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import { SlugPage } from '../SlugPage.mjs';
import { Tabs } from '~components/Tabs.mjs';
import mermaid from 'mermaid';

const { h2, p, div } = html,
    groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
        arr.reduce((groups, item) => {
            (groups[key(item)] ||= []).push(item);

            return groups;
        }, {} as Record<K, T[]>);


mermaid.initialize({
    startOnLoad: true,
    theme: 'dark'
});

export class Stakeholders extends SlugPage {
    static {
        customElements.define('x-stakeholders-page', this);
    }

    #goalsRepository = new GoalsRepository();
    #stakeholderRepository = new StakeholderRepository();
    #goals?: Goals;

    constructor() {
        super({ title: 'Stakeholders' }, []);

        const dataTable = new DataTable<Stakeholder>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                name: { headerText: 'Name', required: true },
                description: { headerText: 'Description', required: true },
                segmentation: { headerText: 'Segmentation', formType: 'select', options: Object.values(StakeholderSegmentation) },
                category: { headerText: 'Category', formType: 'select', options: Object.values(StakeholderCategory) }
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
            clientGroups = groupBy(
                stakeholders[StakeholderSegmentation.Client] ?? [],
                ({ category }) => category
            ),
            vendorGroups = groupBy(
                stakeholders[StakeholderSegmentation.Vendor] ?? [],
                ({ category }) => category
            ),
            chartDefinition = (groups: Record<StakeholderCategory, Stakeholder[]>, category: StakeholderSegmentation) => `
                quadrantChart
                title ${category}
                x-axis Low Availability --> High Availability
                y-axis Low Infuence --> High Influence
                quadrant-1 "Shadow Influencers (Manage)"
                quadrant-2 "Key Stakeholders (Satisfy)"
                quadrant-3 "Fellow Travelers (Monitor)"
                quadrant-4 "Observers (Inform)"
                ${(groups[StakeholderCategory.ShadowInfluencer] ?? [])
                    .map(({ name }) => `"${name}": [0.75, 0.75]`)?.join('\n')
                }
                ${(groups[StakeholderCategory.KeyStakeholder] ?? [])
                    .map(({ name }) => `"${name}": [0.25, 0.75]`)?.join('\n')
                }
                ${(groups[StakeholderCategory.FellowTraveler] ?? [])
                    .map(({ name }) => `"${name}": [0.25, 0.25]`)?.join('\n')
                }
                ${(groups[StakeholderCategory.Observer] ?? [])
                    .map(({ name }) => `"${name}": [0.75, 0.25]`)?.join('\n')
                }
            `,
            { svg: svgClient } = await mermaid.render('clientMap', chartDefinition(clientGroups, StakeholderSegmentation.Client)),
            { svg: svgVendor } = await mermaid.render('vendorMap', chartDefinition(vendorGroups, StakeholderSegmentation.Vendor));
        mermaidContainer.innerHTML = `${svgClient}<br>${svgVendor}`;
    }
}