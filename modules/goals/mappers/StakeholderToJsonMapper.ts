import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import Stakeholder, { StakeholderSegmentation } from "../domain/Stakeholder";

export interface StakeholderJson extends RequirementJson {
    availability: number
    influence: number
    segmentation: string
}

export default class StakeholderToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: StakeholderJson): Stakeholder {
        return new Stakeholder({
            id: target.id,
            parentId: target.parentId,
            availability: target.availability,
            influence: target.influence,
            segmentation: target.segmentation as StakeholderSegmentation,
            name: target.name,
            property: target.property,
            statement: target.statement
        })
    }

    override mapTo(source: Stakeholder): StakeholderJson {
        const requirement = super.mapTo(source)

        return {
            ...requirement,
            availability: source.availability,
            influence: source.influence,
            segmentation: source.segmentation
        }
    }
}