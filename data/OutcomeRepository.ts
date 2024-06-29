import Outcome from "../domain/Outcome";
import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";

export default class OutcomeRepository extends PGLiteEntityRepository<Outcome> {
    constructor() { super('cathedral.outcome', Outcome) }
}