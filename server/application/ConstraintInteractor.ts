import Interactor from "~/server/application/Interactor";
import Constraint from "~/server/domain/requirements/Constraint";
import Repository from "./Repository";

export default class ConstraintInteractor extends Interactor<Constraint> {
    constructor(repository: Repository<Constraint>) {
        super(repository, Constraint)
    }
}