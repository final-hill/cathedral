import type Presenter from '~/application/Presenter.mjs';
import Page from '../../Page.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import GoalsInteractor from '~/application/GoalsInteractor.mjs';
import { emptyUuid, type Uuid } from '~/domain/Uuid.mjs';
import type Goals from '~/domain/Goals.mjs';

export default abstract class _GoalsPage extends Page implements Presenter<Goals> {
    #solutionRepository = new SolutionRepository(localStorage);
    #interactor: GoalsInteractor = new GoalsInteractor({
        presenter: this,
        repository: new GoalsRepository(localStorage)
    });

    #goalsId!: Uuid; // assigned in connectedCallback

    get goalsId() { return this.#goalsId; }
    get interactor() { return this.#interactor; }

    override async connectedCallback() {
        super.connectedCallback();
        const solutionSlug = this.urlParams['solution'],
            solution = await this.#solutionRepository.getBySlug(solutionSlug);

        if (!solution) {
            self.navigation.navigate(
                `/-not-found-?message=Solution "${solutionSlug}" not found`
            );
        } else if (solution.goalsId === emptyUuid) {
            this.#goalsId = (await this.#interactor.create({
                functionalBehaviors: [],
                objective: '',
                outcomes: '',
                situation: '',
                stakeholders: [],
                useCases: [],
                limits: []
            })).id;
            solution.goalsId = this.#goalsId;
            await this.#solutionRepository.update(solution);
        } else {
            this.#goalsId = solution.goalsId;
        }

        this.#interactor.presentItem(this.#goalsId);
    }

    presentItem(_entity: Goals): void {
        throw new Error('Method not implemented.');
    }

    presentList(_entities: Goals[]): void {
        throw new Error('Method not implemented.');
    }
}