import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import Constraint from "../domain/Constraint";

export default class ConstraintRepository extends PGLiteEntityRepository<Constraint> {
    constructor() { super(`cathedral."constraint"`, Constraint) }
}