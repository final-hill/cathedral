import Interactor from "~/server/application/Interactor";
import Invariant from "~/server/domain/requirements/Invariant";
import Repository from "./Repository";

export default class InvariantInteractor extends Interactor<Invariant> {
    constructor(repository: Repository<Invariant>) {
        super(repository, Invariant)
    }
}