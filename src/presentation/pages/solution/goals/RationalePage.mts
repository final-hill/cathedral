import Goals from '~/domain/Goals.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import Page from '~/presentation/pages/Page.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';

const { form, h3, p, textarea } = html;

export default class RationalePage extends Page {
    static override route = '/:solution/goals/rationale';
    static {
        customElements.define('x-page-rationale', this);
    }

    #solutionRepository = new SolutionRepository(localStorage);
    #goalsRepository = new GoalsRepository(localStorage);
    #goals!: Goals;

    constructor() {
        super({ title: 'Rationale' }, []);

        this.#solutionRepository.getBySlug(this.urlParams['solution'])!.then(solution => {
            this.#goalsRepository.get(solution!.goalsId)!.then(goals => {
                const { situation, objective, outcomes } = this.#goals = goals!;

                this.replaceChildren(
                    form({ class: 'form-rationale', autocomplete: 'off' }, [
                        h3('Situation'),
                        p(
                            `The situation is the current state of affairs that need to be
                                addressed by a system created by a project.`
                        ),
                        textarea({
                            name: 'situation',
                            value: situation,
                            onchange: e => {
                                const txtSituation = e.target as HTMLTextAreaElement;
                                this.#goals.situation = txtSituation.value.trim();
                                this.#goalsRepository.update(this.#goals);
                            }
                        }, []),
                        h3('Objective'),
                        p(
                            `The objective is the reason for building a system and the organization
                                 context in which it will be used.`
                        ),
                        textarea({
                            name: 'objective',
                            value: objective,
                            onchange: e => {
                                const txtObjective = e.target as HTMLTextAreaElement;
                                this.#goals.objective = txtObjective.value.trim();
                                this.#goalsRepository.update(this.#goals);
                            }
                        }, []),
                        h3('Outcomes'),
                        p(
                            'Outcomes are the results of the project that will be achieved by the system.'
                        ),
                        textarea({
                            name: 'outcomes',
                            value: outcomes,
                            onchange: e => {
                                const txtOutcomes = e.target as HTMLTextAreaElement;
                                this.#goals.outcomes = txtOutcomes.value.trim();
                                this.#goalsRepository.update(this.#goals);
                            }
                        }, [])
                    ])
                );
            });
        });
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
}