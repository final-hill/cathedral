import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import NonFunctionalBehavior from "../domain/NonFunctionalBehavior";

export default class NonFunctionalBehaviorRepository extends PGLiteEntityRepository<NonFunctionalBehavior> {
    constructor() { super('cathedral.non_functional_behavior', NonFunctionalBehavior); }
}