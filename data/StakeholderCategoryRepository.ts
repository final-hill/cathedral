import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import StakeholderCategory from "../domain/StakeholderCategory";

export default class StakeholderCategoryRepository extends PGLiteEntityRepository<StakeholderCategory> {
    constructor() { super('cathedral.stakeholder_category', StakeholderCategory) }
}