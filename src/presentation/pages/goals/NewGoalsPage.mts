import Goals from '~/domain/Goals.mjs';
import PEGS from '~/domain/PEGS.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import requiredTheme from '~/presentation/theme/requiredTheme.mjs';
import formTheme from '~/presentation/theme/formTheme.mjs';
import Page from '../Page.mjs';

const { form, label, input, span, button } = html;

export default class NewGoalsPage extends Page {
    static override route = '/goals/new-entry';
    static {
        customElements.define('x-new-goals-page', this);
    }

    #repository = new GoalsRepository(localStorage);
    #form!: HTMLFormElement;
    #txtName!: HTMLInputElement;
    #txtSlug!: HTMLInputElement;

    constructor() {
        super({ title: 'New Goals' }, [
            form({
                className: 'goals-form',
                autocomplete: 'off'
            }, [
                label({ htmlFor: 'name', className: 'required' }, 'Name'),
                input({
                    type: 'text', name: 'name', id: 'name', required: true,
                    placeholder: 'My Goals', maxLength: Goals.maxNameLength
                }, []),
                label({ htmlFor: 'slug' }, 'Slug'),
                input({ type: 'text', name: 'slug', id: 'slug', readOnly: true }, []),
                label({ htmlFor: 'description' }, 'Description'),
                input({
                    type: 'text', name: 'description', id: 'description',
                    placeholder: 'A description of my goals', maxLength: Goals.maxDescriptionLength
                }, []),
                span({ id: 'actions' }, [
                    button({ type: 'submit' }, 'Create'),
                    button({ type: 'reset' }, 'Cancel')
                ])
            ])
        ]);
        this.#form = this.querySelector('form')!;
        this.#form.addEventListener('submit', this);
        this.#form.addEventListener('reset', this);
        this.#txtName = this!.querySelector('#name')!;
        this.#txtName.addEventListener('input', this);
        this.#txtSlug = this.querySelector('#slug')!;
    }

    override _initPageStyle() {
        return {
            ...super._initPageStyle(),
            ...requiredTheme,
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
        };
    }

    async onInput(e: Event) {
        const name = (e.target as HTMLInputElement).value,
            slug = PEGS.slugify(name);
        this.#txtSlug.value = slug;
    }

    async onSubmit(e: SubmitEvent) {
        e.preventDefault();
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
                functionalBehaviors: [],
                useCases: [],
                limits: []
            });

        await this.#repository.add(goals);
        self.navigation.navigate(`/goals/${goals.slug()}`);
    }

    onReset() {
        self.navigation.navigate('/goals');
    }
}