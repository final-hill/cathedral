import Stakeholder, { StakeholderSegmentation } from '~/domain/Stakeholder.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';

export interface StakeholderJson extends EntityJson {
    description: string;
    name: string;
    segmentation: string;
    influence: number;
    availability: number;
}

export default class StakeholderToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: StakeholderJson): Stakeholder {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Stakeholder({
                description: target.description,
                id: target.id,
                name: target.name,
                segmentation: target.segmentation as StakeholderSegmentation,
                influence: target.influence ?? 0,
                availability: target.availability ?? 0
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Stakeholder): StakeholderJson {
        return {
            ...super.mapTo(source),
            description: source.description,
            name: source.name,
            segmentation: source.segmentation,
            influence: source.influence,
            availability: source.availability
        };
    }
}