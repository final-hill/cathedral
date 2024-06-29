import Goal from "../domain/Goal";
import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";

export default class GoalRepository extends PGLiteEntityRepository<Goal> {
    constructor() { super('cathedral.goal', Goal) }
}