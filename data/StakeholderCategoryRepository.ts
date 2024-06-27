import PGLiteRepository from "~/data/PGLiteRepository";
import StakeholderCategory from "../domain/StakeholderCategory";

export default class StakeholderCategoryRepository extends PGLiteRepository<StakeholderCategory> {
    constructor() { super('cathedral.stakeholder_category', StakeholderCategory) }
}