import { Solution } from '~/domain/index.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';

export default class SolutionInteractor extends Interactor<Solution> {
    constructor({ presenter, repository }: {
        presenter: Presenter<Solution>;
        repository: Repository<Solution>;
    }) {
        super({ presenter, repository, Entity: Solution });
    }

    async getBySlug(slug: string) {
        return (await this.repository.getAll(s => s.slug() === slug))[0];
    }
}