import Interactor from "~/server/application/Interactor";
import Limit from "~/server/domain/Limit";
import Repository from "./Repository";

export default class LimitInteractor extends Interactor<Limit> {
    constructor(repository: Repository<Limit>) {
        super(repository, Limit)
    }
}