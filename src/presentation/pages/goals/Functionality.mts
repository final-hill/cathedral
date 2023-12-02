import { Behavior } from "~/domain/Behavior.mjs";
import type { Goals } from "~/domain/Goals.mjs";
import { GoalsRepository } from "~/data/GoalsRepository.mjs";
import { BehaviorRepository } from "~/data/BehaviorRepository.mjs";
import html from "~/presentation/lib/html.mjs";
import { DataTable } from "~/presentation/components/DataTable.mjs";
import { SlugPage } from "../SlugPage.mjs";

const { p, strong, template, slot } = html

export class Functionality extends SlugPage {
    static {
        customElements.define('x-functionality-page', this)
    }

    #goalsRepository = new GoalsRepository()
    #behaviorRepository = new BehaviorRepository()
    #goals?: Goals

    constructor() {
        super({ title: 'Functionality' }, [])

        const slot = this.shadowRoot.querySelector('slot')!,
            dataTable = new DataTable({
                columns: {
                    id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                    statement: { headerText: 'Statement', required: true }
                },
                select: async () => {
                    if (!this.#goals)
                        return []
                    return await this.#behaviorRepository.getAll(b => this.#goals!.functionalBehaviors.includes(b.id))
                },
                onCreate: async (item) => {
                    const behavior = new Behavior({ ...item, id: self.crypto.randomUUID() })
                    await this.#behaviorRepository.add(behavior)
                    this.#goals!.functionalBehaviors.push(behavior.id)
                    await this.#goalsRepository.update(this.#goals!)
                },
                onUpdate: async (item) => {
                    const behavior = (await this.#behaviorRepository.get(item.id))!
                    behavior.statement = item.statement
                    await this.#behaviorRepository.update(behavior)
                },
                onDelete: async (id) => {
                    await this.#behaviorRepository.delete(id)
                    this.#goals!.functionalBehaviors = this.#goals!.functionalBehaviors.filter(x => x !== id)
                    await this.#goalsRepository.update(this.#goals!)
                }
            })
        slot.append(dataTable)

        this.#goalsRepository.addEventListener('update', () => dataTable.renderData())
        this.#behaviorRepository.addEventListener('update', () => dataTable.renderData())
        this.#goalsRepository.getBySlug(this.slug).then(goals => {
            this.#goals = goals
            dataTable.renderData()
        })
    }

    protected override _initHtml(): HTMLTemplateElement {
        return template([
            p([
                `This section describes the high - level functional behaviors of a system.
                Specify what results or effects are expected. Describe `,
                strong('what'), ` the system should do, not `, strong('how'), ` it should do it.`
            ]),
            slot()
        ])
    }
}