import Interactor from "~/server/application/Interactor";
import UseCase from "~/server/domain/requirements/UseCase";
import Repository from "./Repository";

export default class UseCaseInteractor extends Interactor<UseCase> {
    constructor(repository: Repository<UseCase>) {
        super(repository, UseCase)
    }
}