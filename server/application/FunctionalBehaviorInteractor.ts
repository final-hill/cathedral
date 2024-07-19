import Interactor from "~/server/application/Interactor";
import FunctionalBehavior from "~/server/domain/requirements/FunctionalBehavior";
import Repository from "./Repository";

export default class FunctionalBehaviorInteractor extends Interactor<FunctionalBehavior> {
    constructor(repository: Repository<FunctionalBehavior>) {
        super(repository, FunctionalBehavior)
    }
}