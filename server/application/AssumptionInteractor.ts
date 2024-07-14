import Interactor from "~/server/application/Interactor";
import Assumption from "~/server/domain/Assumption";
import Repository from "./Repository";

export default class AssumptionInteractor extends Interactor<Assumption> {
    constructor(repository: Repository<Assumption>) {
        super(repository, Assumption)
    }
}