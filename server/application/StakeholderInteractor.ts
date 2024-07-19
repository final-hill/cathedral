import Interactor from "~/server/application/Interactor";
import Stakeholder from "~/server/domain/requirements/Stakeholder";
import Repository from "./Repository";

export default class StakeholderInteractor extends Interactor<Stakeholder> {
    constructor(repository: Repository<Stakeholder>) {
        super(repository, Stakeholder)
    }
}