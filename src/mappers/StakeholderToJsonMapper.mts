import Stakeholder, { StakeholderCategory, StakeholderSegmentation } from '~/domain/Stakeholder.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';

export interface StakeholderJson extends EntityJson {
    category: string;
    description: string;
    name: string;
    segmentation: string;
}

export default class StakeholderToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: StakeholderJson): Stakeholder {
        return new Stakeholder({
            category: target.category as StakeholderCategory,
            description: target.description,
            id: target.id,
            name: target.name,
            segmentation: target.segmentation as StakeholderSegmentation
        });
    }

    override mapTo(source: Stakeholder): StakeholderJson {
        return {
            ...super.mapTo(source),
            category: source.category,
            description: source.description,
            name: source.name,
            segmentation: source.segmentation
        };
    }
}