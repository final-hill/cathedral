import EnvironmentInteractor from '~/application/EnvironmentInteractor.mjs';
import EnvironmentRepository from '~/data/EnvironmentRepository.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import Page from '../../Page.mjs';
import type Environment from '~/domain/Environment.mjs';
import { emptyUuid, type Uuid } from '~/domain/Uuid.mjs';
import type Presenter from '~/application/Presenter.mjs';

export default abstract class _EnvironmentPage extends Page implements Presenter<Environment> {
    #solutionRepository = new SolutionRepository(localStorage);
    #interactor: EnvironmentInteractor = new EnvironmentInteractor({
        presenter: this,
        repository: new EnvironmentRepository(localStorage)
    });

    #environmentId!: Uuid; // assigned in connectedCallback

    get environmentId() { return this.#environmentId; }
    get interactor() { return this.#interactor; }

    override async connectedCallback() {
        super.connectedCallback();
        const solutionSlug = this.urlParams['solution'],
            solution = await this.#solutionRepository.getBySlug(solutionSlug);

        if (!solution) {
            self.navigation.navigate(
                `/-not-found-?message=Solution "${solutionSlug}" not found`
            );
        } else if (solution.environmentId === emptyUuid) {
            this.#environmentId = (await this.#interactor.create({
                assumptions: [],
                components: [],
                constraints: [],
                effects: [],
                glossaryTerms: [],
                invariants: []
            })).id;
            solution.environmentId = this.#environmentId;
            await this.#solutionRepository.update(solution);
        } else {
            this.#environmentId = solution.environmentId;
        }

        await this.interactor.presentItem(this.#environmentId);
    }

    presentItem(_entity: Environment): void {
        throw new Error('Method not implemented.');
    }
    presentList(_entities: Environment[]): void {
        throw new Error('Method not implemented.');
    }
}