import html from '~/presentation/lib/html.mjs';
import _GoalsPage from './_GoalsPage.mjs';
import { type Goals } from '~/domain/index.mjs';

const { form, h3, p, textarea } = html;

export default class RationalePage extends _GoalsPage {
    static override route = '/:solution/goals/rationale';
    static {
        customElements.define('x-page-rationale', this);
    }

    #goals!: Goals; // Assigned via super.connectedCallback() -> this.presentItem()
    #txtSituation; #txtObjective; #txtOutcomes;

    constructor() {
        super({ title: 'Rationale' });

        this.append(
            form({ class: 'form-rationale', autocomplete: 'off' }, [
                h3('Situation'),
                p(
                    `The situation is the current state of affairs that need to be
                    addressed by a system created by a project.`
                ),
                this.#txtSituation = textarea({ name: 'situation' }),
                h3('Objective'),
                p(
                    `The objective is the reason for building a system and the organization
                    context in which it will be used.`
                ),
                this.#txtObjective = textarea({ name: 'objective' }),
                h3('Outcomes'),
                p(
                    'Outcomes are the results of the project that will be achieved by the system.'
                ),
                this.#txtOutcomes = textarea({ name: 'outcomes' })
            ])
        );
    }

    protected override _initPageStyle() {
        return {
            ...super._initPageStyle(),
            form: {
                display: 'flex',
                flexDirection: 'column'
            },
            textarea: {
                height: '200px'
            }
        };
    }

    override async connectedCallback(): Promise<undefined> {
        await super.connectedCallback();

        this.#txtSituation.onchange = () => {
            this.interactor.update({
                ...this.#goals,
                situation: this.#txtSituation.value.trim()
            });
        };
        this.#txtObjective.onchange = () => {
            this.interactor.update({
                ...this.#goals,
                objective: this.#txtObjective.value.trim()
            });
        };
        this.#txtOutcomes.onchange = () => {
            this.interactor.update({
                ...this.#goals,
                outcomes: this.#txtOutcomes.value.trim()
            });
        };
    }

    override presentItem(goals: Goals): void {
        const { situation, objective, outcomes } = this.#goals = goals;

        this.#txtSituation.value = situation;
        this.#txtObjective.value = objective;
        this.#txtOutcomes.value = outcomes;
    }
}