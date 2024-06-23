import PGLiteRepository from "~/data/PGLiteRepository";
import Stakeholder from "../domain/Stakeholder";

export default class StakeholderRepository extends PGLiteRepository<Stakeholder> {
    constructor() { super('cathedral.stakeholder', Stakeholder) }
}