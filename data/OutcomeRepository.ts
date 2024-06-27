import Outcome from "../domain/Outcome";
import PGLiteRepository from "~/data/PGLiteRepository";

export default class OutcomeRepository extends PGLiteRepository<Outcome> {
    constructor() { super('cathedral.outcome', Outcome) }
}