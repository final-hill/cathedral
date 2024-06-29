import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import FunctionalBehavior from "../domain/FunctionalBehavior";

export default class FunctionalBehaviorRepository extends PGLiteEntityRepository<FunctionalBehavior> {
    constructor() { super('cathedral.functional_behavior', FunctionalBehavior); }
}