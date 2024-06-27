import Goal from "../domain/Goal";
import PGLiteRepository from "~/data/PGLiteRepository";

export default class GoalRepository extends PGLiteRepository<Goal> {
    constructor() { super('cathedral.goal', Goal) }
}