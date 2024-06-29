import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import StakeholderSegmentation from "../domain/StakeholderSegmentation";

export default class StakeholderSegmentationRepository extends PGLiteEntityRepository<StakeholderSegmentation> {
    constructor() { super('cathedral.stakeholder_segmentation', StakeholderSegmentation) }
}