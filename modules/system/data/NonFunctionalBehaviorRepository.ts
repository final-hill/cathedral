import PGLiteRepository from "~/data/PGLiteRepository";
import NonFunctionalBehavior from "../domain/NonFunctionalBehavior";

export default class NonFunctionalBehaviorRepository extends PGLiteRepository<NonFunctionalBehavior> {
    constructor() {
        super('cathedral.non_functional_behavior', NonFunctionalBehavior);
    }
}