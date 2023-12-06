import { Environment } from '~/domain/Environment.mjs';
import { EnvironmentRepository } from '~/data/EnvironmentRepository.mjs';
import { formTheme } from '~/presentation/themes.mjs';
import Page from '../Page.mjs';
import html from '~/presentation/lib/html.mjs';
import { PEGS } from '~/domain/PEGS.mjs';

const { form, label, input, span, button } = html;

export class NewEnvironment extends Page {
    static {
        customElements.define('x-new-environment-page', this);
    }

    #repository = new EnvironmentRepository();
    #form!: HTMLFormElement;
    #txtName!: HTMLInputElement;
    #txtSlug!: HTMLInputElement;

    constructor() {
        super({ title: 'New Environment' }, []);

        this.shadowRoot.appendChild(
            this.#form = form({
                className: 'environment-form',
                autocomplete: 'off'
            }, [
                label({ htmlFor: 'name', className: 'required' }, ['Name', span('*')]),
                this.#txtName = input({
                    type: 'text', name: 'name', id: 'name', required: true,
                    placeholder: 'Sample Environment', maxLength: Environment.maxNameLength
                }, []),
                label({ htmlFor: 'slug' }, 'Slug'),
                this.#txtSlug = input({ type: 'text', name: 'slug', id: 'slug', readOnly: true }, []),
                label({ htmlFor: 'description' }, 'Description'),
                input({
                    type: 'text', name: 'description', id: 'description',
                    placeholder: 'A description of the environment', maxLength: Environment.maxDescriptionLength
                }, []),
                span({ id: 'actions' }, [
                    button({ type: 'submit' }, 'Create'),
                    button({ type: 'reset' }, 'Cancel')
                ])
            ])
        );

        this.#form.addEventListener('submit', this);
        this.#form.addEventListener('reset', this);
        this.#txtName.addEventListener('input', this);
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            ...formTheme,
            '.environment-form': {
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

    async onSubmit(e: Event) {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),

            environment = new Environment({
                id: self.crypto.randomUUID(),
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                glossary: []
            });
        this.#repository.add(environment);

        self.navigation.navigate(`/environments/${environment.slug()}`);
    }

    onReset() {
        self.navigation.navigate('/goals');
    }
}