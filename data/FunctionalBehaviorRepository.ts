import PGLiteRepository from "~/data/PGLiteRepository";
import FunctionalBehavior from "../domain/FunctionalBehavior";

export default class FunctionalBehaviorRepository extends PGLiteRepository<FunctionalBehavior> {
    constructor() {
        super('cathedral.functional_behavior', FunctionalBehavior);
    }
}