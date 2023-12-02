import { Goals } from "~/domain/Goals.mjs";
import { GoalsRepository } from "~/data/GoalsRepository.mjs";
import html from "~/presentation/lib/html.mjs";
import { formTheme } from "~/presentation/themes.mjs";
import { SlugPage } from "../SlugPage.mjs";

const { form, h3, p, textarea } = html

export class Rationale extends SlugPage {
    static {
        customElements.define('x-rationale-page', this)
    }

    #repository = new GoalsRepository()
    #goals!: Goals

    constructor() {
        super({ title: 'Rationale' }, [])

        this.#repository.getBySlug(this.slug)!.then(goals => {
            if (!goals) {
                this.shadowRoot.querySelector('slot')!.replaceChildren(
                    p(`No goals found for the provided slug: ${this.slug}`)
                )
            } else {
                const { situation, objective, outcomes } = this.#goals = goals!

                this.shadowRoot.querySelector<HTMLTextAreaElement>('textarea[name="situation"]')!
                    .value = situation
                this.shadowRoot.querySelector<HTMLTextAreaElement>('textarea[name="objective"]')!
                    .value = objective
                this.shadowRoot.querySelector<HTMLTextAreaElement>('textarea[name="outcomes"]')!
                    .value = outcomes
            }
        })
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            ...formTheme,
            'form': {
                display: 'flex',
                flexDirection: 'column'
            },
            'textarea': {
                height: '200px'
            }
        }
    }

    override init() {
        this.shadowRoot.querySelector('slot')!.replaceChildren(
            form({ class: 'form-rationale', autocomplete: 'off' }, [
                h3('Situation'),
                p(
                    `The situation is the current state of affairs that need to be
                    addressed by a system created by a project.`
                ),
                textarea({ name: 'situation', value: '' }, []),
                h3('Objective'),
                p(
                    `The objective is the reason for building a system and the organization
                     context in which it will be used.`
                ),
                textarea({ name: 'objective', value: '' }, []),
                h3('Outcomes'),
                p(
                    `Outcomes are the results of the project that will be achieved by the system.`
                ),
                textarea({ name: 'outcomes', value: '' }, [])
            ])
        )

        this.shadowRoot.querySelector<HTMLTextAreaElement>('textarea[name="situation"]')!
            .onchange = (e) => this.updateSituation(e)
        this.shadowRoot.querySelector<HTMLTextAreaElement>('textarea[name="objective"]')!
            .onchange = (e) => this.updateObjective(e)
        this.shadowRoot.querySelector<HTMLTextAreaElement>('textarea[name="outcomes"]')!
            .onchange = (e) => this.updateOutcomes(e)
    }

    updateObjective(e: Event) {
        const txtObjective = e.target as HTMLTextAreaElement
        this.#goals.objective = txtObjective.value.trim()
        this.#repository.update(this.#goals)
    }

    updateOutcomes(e: Event) {
        const txtOutcomes = e.target as HTMLTextAreaElement
        this.#goals.outcomes = txtOutcomes.value.trim()
        this.#repository.update(this.#goals)
    }

    updateSituation(e: Event) {
        const txtSituation = e.target as HTMLTextAreaElement
        this.#goals.situation = txtSituation.value.trim()
        this.#repository.update(this.#goals)
    }
}