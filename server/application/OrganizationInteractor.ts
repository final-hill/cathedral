import Organization from "~/server/domain/application/Organization";
import Interactor from "~/server/application/Interactor";
import Repository from "./Repository";

export default class SolutionInteractor extends Interactor<Organization> {
    constructor(repository: Repository<Organization>) {
        super(repository, Organization)
    }
}