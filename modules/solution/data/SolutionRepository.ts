import Solution from "../domain/Solution";
import PGLiteRepository from "~/data/PGLiteRepository";

export default class SolutionRepository extends PGLiteRepository<Solution> {
    constructor() { super('cathedral.solution', Solution) }
}