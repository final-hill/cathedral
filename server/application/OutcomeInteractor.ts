import Interactor from "~/server/application/Interactor";
import Outcome from "~/server/domain/Outcome";
import Repository from "./Repository";

export default class OutcomeInteractor extends Interactor<Outcome> {
    constructor(repository: Repository<Outcome>) {
        super(repository, Outcome)
    }
}