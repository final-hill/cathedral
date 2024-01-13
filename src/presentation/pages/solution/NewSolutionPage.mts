import Solution from '~/domain/Solution.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import Page from '../Page.mjs';
import html from '~/presentation/lib/html.mjs';
import requiredTheme from '~/presentation/theme/requiredTheme.mjs';
import formTheme from '~/presentation/theme/formTheme.mjs';
import slugify from '~/lib/slugify.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import ProjectRepository from '~/data/ProjectRepository.mjs';
import SystemRepository from '~/data/SystemRepository.mjs';
import Environment from '~/domain/Environment.mjs';
import Goals from '~/domain/Goals.mjs';
import Project from '~/domain/Project.mjs';
import System from '~/domain/System.mjs';

const { form, label, input, span, button } = html;

export default class NewSolutionPage extends Page {
    static override route = '/new-entry';
    static {
        customElements.define('x-page-new-solution', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #environmentRepository = new EnvironmentRepository(localStorage);
    #goalsRepository = new GoalsRepository(localStorage);
    #projectRepository = new ProjectRepository(localStorage);
    #systemRepository = new SystemRepository(localStorage);
    #form!: HTMLFormElement;
    #txtName!: HTMLInputElement;
    #txtSlug!: HTMLInputElement;

    constructor() {
        super({ title: 'New Solution' }, []);

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
                this.#txtSlug = input({ type: 'text', name: 'slug', id: 'slug', readOnly: true }, []),
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
            solution = new Solution({
                id: self.crypto.randomUUID(),
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                environmentId: self.crypto.randomUUID(),
                goalsId: self.crypto.randomUUID(),
                projectId: self.crypto.randomUUID(),
                systemId: self.crypto.randomUUID()
            }),
            environment = new Environment({
                id: solution.environmentId,
                glossaryIds: [],
                constraintIds: [],
                invariantIds: [],
                assumptionIds: []
            }),
            goals = new Goals({
                id: solution.goalsId,
                stakeholderIds: [],
                functionalBehaviorIds: [],
                limitIds: [],
                objective: '',
                outcomes: '',
                situation: '',
                useCaseIds: []
            }),
            project = new Project({
                id: solution.projectId
            }),
            system = new System({
                id: solution.systemId,
            });

        await Promise.all([
            this.#solutionRepository.add(solution),
            this.#environmentRepository.add(environment),
            this.#goalsRepository.add(goals),
            this.#projectRepository.add(project),
            this.#systemRepository.add(system)
        ]);

        self.navigation.navigate(`/${solution.slug()}`);
    }

    onReset() {
        self.navigation.navigate('/');
    }
}