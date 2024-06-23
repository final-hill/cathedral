import PGLiteRepository from "~/data/PGLiteRepository";
import StakeholderSegmentation from "../domain/StakeholderSegmentation";

export default class StakeholderSegmentationRepository extends PGLiteRepository<StakeholderSegmentation> {
    constructor() { super('cathedral.stakeholder_segmentation', StakeholderSegmentation) }
}