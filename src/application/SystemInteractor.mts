import System from '~/domain/System.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';

export default class SystemInteractor extends Interactor<System> {
    constructor({ presenter, repository }: {
        presenter: Presenter<System>;
        repository: Repository<System>;
    }) {
        super({ presenter, repository, Entity: System });
    }
}