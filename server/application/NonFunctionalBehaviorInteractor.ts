import Interactor from "~/server/application/Interactor";
import NonFunctionalBehavior from "~/server/domain/NonFunctionalBehavior";
import Repository from "./Repository";

export default class NonFunctionalBehaviorInteractor extends Interactor<NonFunctionalBehavior> {
    constructor(repository: Repository<NonFunctionalBehavior>) {
        super(repository, NonFunctionalBehavior)
    }
}