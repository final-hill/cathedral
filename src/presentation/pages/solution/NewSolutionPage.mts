import { Solution, emptyUuid } from '~/domain/index.mjs';
import html from '~/presentation/lib/html.mjs';
import requiredTheme from '~/presentation/theme/requiredTheme.mjs';
import formTheme from '~/presentation/theme/formTheme.mjs';
import slugify from '~/lib/slugify.mjs';
import _SolutionPage from './_SolutionPage.mjs';

const { form, label, input, span, button } = html;

export default class NewSolutionPage extends _SolutionPage {
    static override route = '/new-entry';
    static {
        customElements.define('x-page-new-solution', this);
    }

    #form!: HTMLFormElement;
    #txtName!: HTMLInputElement;
    #txtSlug!: HTMLInputElement;

    constructor() {
        super({ title: 'New Solution' });

        this.appendChild(
            this.#form = form({
                className: 'solution-form',
                autocomplete: 'off'
            }, [
                label({ htmlFor: 'name', className: 'required' }, 'Name'),
                this.#txtName = input({
                    type: 'text', name: 'name', id: 'name', required: true,
                    placeholder: 'Sample Solution', maxLength: Solution.maxNameLength
                }, []),
                label({ htmlFor: 'slug' }, 'Slug'),
                this.#txtSlug = input({ type: 'text', name: 'slug', id: 'slug', readOnly: true, tabIndex: -1 }, []),
                label({ htmlFor: 'description' }, 'Description'),
                input({
                    type: 'text', name: 'description', id: 'description',
                    placeholder: 'A description of the solution', maxLength: Solution.maxDescriptionLength
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

    protected override _initPageStyle() {
        return {
            ...super._initPageStyle(),
            ...requiredTheme,
            ...formTheme,
            '.solution-form': {
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
            slug = slugify(name);
        this.#txtSlug.value = slug;
    }

    async onSubmit(e: Event) {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            solution = await this.interactor.create({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                environmentId: emptyUuid,
                goalsId: emptyUuid,
                projectId: emptyUuid,
                systemId: emptyUuid
            });

        self.navigation.navigate(`/${solution.slug()}`);
    }

    onReset() {
        self.navigation.navigate('/');
    }

    override presentItem(_entity: Solution): void { }

    override presentList(_entities: Solution[]): void { }
}