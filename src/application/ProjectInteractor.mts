import { Project } from '~/domain/index.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';

export default class ProjectInteractor extends Interactor<Project> {
    constructor({ presenter, repository }: {
        presenter: Presenter<Project>;
        repository: Repository<Project>;
    }) {
        super({ presenter, repository, Entity: Project });
    }
}