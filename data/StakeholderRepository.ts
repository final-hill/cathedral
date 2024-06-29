import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import Stakeholder from "../domain/Stakeholder";

export default class StakeholderRepository extends PGLiteEntityRepository<Stakeholder> {
    constructor() { super('cathedral.stakeholder', Stakeholder) }
}