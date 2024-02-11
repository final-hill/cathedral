import type Presenter from '~/application/Presenter.mjs';
import Page from '../Page.mjs';
import SolutionInteractor from '~/application/SolutionInteractor.mjs';
import SolutionRepository from '~/data/SolutionRepository.mjs';
import { type Solution } from '~/domain/index.mjs';

export default abstract class _SolutionPage extends Page implements Presenter<Solution> {
    #interactor: SolutionInteractor = new SolutionInteractor({
        presenter: this,
        repository: new SolutionRepository(localStorage)
    });
    #solution!: Solution; // assigned in connectedCallback

    get solution() { return this.#solution; }

    get interactor() { return this.#interactor; }

    override async connectedCallback() {
        super.connectedCallback();
        const solutionSlug = this.urlParams['solution'],
            solution = await this.#interactor.getBySlug(solutionSlug),
            Cons = this.constructor as typeof _SolutionPage;

        if (!solution && Cons.route !== '/new-entry') {
            self.navigation.navigate(
                `/-not-found-?message=Solution "${solutionSlug}" not found`
            );
        } else {
            this.#solution = solution;
            this.interactor.presentList();
        }
    }

    presentItem(_entity: Solution): void {
        throw new Error('Method not implemented.');
    }

    presentList(_entities: Solution[]): void {
        throw new Error('Method not implemented.');
    }
}