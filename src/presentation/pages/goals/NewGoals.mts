import { Goals } from "~/domain/Goals.mjs";
import { PEGS } from "~/domain/PEGS.mjs";
import { GoalsRepository } from "~/data/GoalsRepository.mjs";
import { formTheme } from "~/presentation/themes.mjs";
import html from "~/presentation/lib/html.mjs";
import Page from "../Page.mjs";

const { form, label, input, span, button } = html

export class NewGoals extends Page {
    static {
        customElements.define('x-new-goals-page', this)
    }

    #repository = new GoalsRepository()
    #form!: HTMLFormElement
    #txtName!: HTMLInputElement
    #txtSlug!: HTMLInputElement

    constructor() {
        super({ title: 'New Goals' }, [
            form({
                className: 'goals-form',
                autocomplete: 'off'
            }, [
                label({ htmlFor: 'name', className: 'required' }, 'Name'),
                input({
                    type: 'text', name: 'name', id: 'name', required: true,
                    placeholder: 'My Goals', maxLength: Goals.MAX_NAME_LENGTH
                }, []),
                label({ htmlFor: 'slug' }, 'Slug'),
                input({ type: 'text', name: 'slug', id: 'slug', readOnly: true }, []),
                label({ htmlFor: 'description' }, 'Description'),
                input({
                    type: 'text', name: 'description', id: 'description',
                    placeholder: 'A description of my goals', maxLength: Goals.MAX_DESCRIPTION_LENGTH
                }, []),
                span({ id: 'actions' }, [
                    button({ type: 'submit' }, 'Create'),
                    button({ type: 'reset' }, 'Cancel')
                ])
            ])
        ])
        this.#form = this.shadowRoot!.querySelector('form')!
        this.#form.addEventListener('submit', this)
        this.#form.addEventListener('reset', this)
        this.#txtName = this.shadowRoot!.querySelector('#name')!
        this.#txtName.addEventListener('input', this)
        this.#txtSlug = this.shadowRoot!.querySelector('#slug')!
    }

    override _initStyle() {
        return {
            ...super._initStyle(),
            ...formTheme,
            '.goals-form': {
                display: 'grid',
                gridTemplateColumns: '20% 1fr',
                gridGap: '1rem',
                margin: '1rem'
            },
            'input': {
                maxWidth: '80%',
                width: '40em'
            },
            '#actions': {
                gridColumn: '2',
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '4.5in'
            }
        }
    }

    async onInput(e: Event) {
        const name = (e.target as HTMLInputElement).value,
            slug = PEGS.slugify(name)
        this.#txtSlug.value = slug
    }

    async onSubmit(e: SubmitEvent) {
        e.preventDefault()
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            goals = new Goals({
                id: self.crypto.randomUUID(),
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                objective: '',
                outcomes: '',
                situation: '',
                stakeholders: [],
                functionalBehaviors: []
            })

        await this.#repository.add(goals)
        self.navigation.navigate(`/goals/${goals.slug()}`)
    }

    onReset(e: Event) {
        self.navigation.navigate('/goals')
    }
}