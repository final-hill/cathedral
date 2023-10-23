import { Stakeholders } from "~/domain/Stakeholders";
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from "~/domain/Stakeholder";
import { type Mapper } from "~/usecases/Mapper";

export interface StakeholdersJson {
    id: string;
    stakeholders: StakeholderJson[];
}

export interface StakeholderJson {
    id: string;
    name: string;
    description: string;
    category: string;
    segmentation: string;
}

export class StakeholdersJsonMapper implements Mapper<Stakeholders, StakeholdersJson> {
    mapFrom(item: Stakeholders): StakeholdersJson {
        return {
            id: item.id,
            stakeholders: item.stakeholders.map(stakeholder => ({
                id: stakeholder.id,
                name: stakeholder.name,
                description: stakeholder.description,
                category: stakeholder.category,
                segmentation: stakeholder.segmentation
            }))
        }
    }
    mapTo(item: StakeholdersJson): Stakeholders {
        return new Stakeholders({
            id: item.id,
            stakeholders: item.stakeholders.map(stakeholder => new Stakeholder({
                id: stakeholder.id,
                name: stakeholder.name,
                description: stakeholder.description,
                category: stakeholder.category as StakeholderCategory,
                segmentation: stakeholder.segmentation as StakeholderSegmentation
            }))
        })
    }
}