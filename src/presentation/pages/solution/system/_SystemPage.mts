import type Presenter from '~/application/Presenter.mjs';
import Page from '../../Page.mjs';
import { type System, emptyUuid, type Uuid } from '~/domain/index.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import SystemInteractor from '~/application/SystemInteractor.mjs';
import SystemRepository from '~/data/SystemRepository.mjs';

export default abstract class _SystemPage extends Page implements Presenter<System> {
    #solutionRepository = new SolutionRepository(localStorage);
    #interactor: SystemInteractor = new SystemInteractor({
        presenter: this,
        repository: new SystemRepository(localStorage)
    });

    #systemId!: Uuid; // assigned in connectedCallback

    get systemId() { return this.#systemId; }
    get interactor() { return this.#interactor; }

    override async connectedCallback() {
        super.connectedCallback();
        const solutionSlug = this.urlParams['solution'],
            solution = await this.#solutionRepository.getBySlug(solutionSlug);

        if (!solution) {
            self.navigation.navigate(
                `/-not-found-?message=Solution "${solutionSlug}" not found`
            );
        } else if (solution.systemId === emptyUuid) {
            this.#systemId = (await this.#interactor.create({
                components: []
            })).id;
            solution.systemId = this.#systemId;
            await this.#solutionRepository.update(solution);
        } else {
            this.#systemId = solution.systemId;
        }

        this.#interactor.presentItem(this.#systemId);
    }

    presentItem(_entity: System): void {
        throw new Error('Method not implemented.');
    }

    presentList(_entities: System[]): void {
        throw new Error('Method not implemented.');
    }
}