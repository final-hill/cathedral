import Goals from '~/domain/Goals.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import SlugPage from '../SlugPage.mjs';

const { form, h3, p, textarea } = html;

export class Rationale extends SlugPage {
    static {
        customElements.define('x-rationale-page', this);
    }

    #repository = new GoalsRepository(localStorage);
    #goals!: Goals;

    constructor() {
        super({ title: 'Rationale' }, []);

        this.#repository.getBySlug(this.slug)!.then(goals => {
            if (!goals) {
                this.replaceChildren(
                    p(`No goals found for the provided slug: ${this.slug}`)
                );
            }
            else {
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
                                this.#repository.update(this.#goals);
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
                                this.#repository.update(this.#goals);
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
                                this.#repository.update(this.#goals);
                            }
                        }, [])
                    ])
                );
            }
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