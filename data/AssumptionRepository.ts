import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import Assumption from "../domain/Assumption";

export default class AssumptionRepository extends PGLiteEntityRepository<Assumption> {
    constructor() { super('cathedral.assumption', Assumption) }
}