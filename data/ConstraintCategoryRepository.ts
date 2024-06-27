import PGLiteRepository from "~/data/PGLiteRepository";
import ConstraintCategory from "../domain/ConstraintCategory";

export default class ConstraintCategoryRepository extends PGLiteRepository<ConstraintCategory> {
    constructor() { super('cathedral.constraint_category', ConstraintCategory) }
}