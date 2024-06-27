import PGLiteRepository from "~/data/PGLiteRepository";
import Constraint from "../domain/Constraint";

export default class ConstraintRepository extends PGLiteRepository<Constraint> {
    constructor() { super(`cathedral."constraint"`, Constraint) }
}