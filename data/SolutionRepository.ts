import Solution from "../domain/Solution";
import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";

export default class SolutionRepository extends PGLiteEntityRepository<Solution> {
    constructor() { super('cathedral.solution', Solution) }
}