import type { Goals } from '~/domain/Goals.mjs';
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from '~/domain/Stakeholder.mjs';
import { GoalsRepository } from '~/data/GoalsRepository.mjs';
import { StakeholderRepository } from '~/data/StakeholderRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import { SlugPage } from '../SlugPage.mjs';

const { p, template, slot } = html;

export class Stakeholders extends SlugPage {
    static {
        customElements.define('x-stakeholders-page', this);
    }

    #goalsRepository = new GoalsRepository();
    #stakeholderRepository = new StakeholderRepository();
    #goals?: Goals;

    constructor() {
        super({ title: 'Stakeholders' }, []);

        const slot = this.shadowRoot.querySelector('slot')!,
            dataTable = new DataTable<Stakeholder>({
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
        slot.append(dataTable);

        this.#goalsRepository.addEventListener('update', () => dataTable.renderData());
        this.#stakeholderRepository.addEventListener('update', () => dataTable.renderData());
        this.#goalsRepository.getBySlug(this.slug).then(goals => {
            this.#goals = goals;
            dataTable.renderData();
        });
    }

    protected override _initHtml(): HTMLTemplateElement {
        return template([
            p(`
                Stakeholders are the categories of people who are affected by the
                problem you are trying to solve. Do not list individuals, but rather
                groups or roles. Example: instead of "Jane Doe", use "Project Manager".
            `),
            slot()
        ]);
    }
}