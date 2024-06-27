import PGLiteRepository from "~/data/PGLiteRepository";
import Assumption from "../domain/Assumption";

export default class AssumptionRepository extends PGLiteRepository<Assumption> {
    constructor() { super('cathedral.assumption', Assumption) }
}