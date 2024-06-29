import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import ConstraintCategory from "../domain/ConstraintCategory";

export default class ConstraintCategoryRepository extends PGLiteEntityRepository<ConstraintCategory> {
    constructor() { super('cathedral.constraint_category', ConstraintCategory) }
}