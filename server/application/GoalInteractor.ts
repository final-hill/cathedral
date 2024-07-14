import Interactor from "~/server/application/Interactor";
import Goal from "~/server/domain/Goal";
import Repository from "./Repository";

export default class GoalInteractor extends Interactor<Goal> {
    constructor(repository: Repository<Goal>) {
        super(repository, Goal)
    }
}