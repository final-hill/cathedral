import { SlugEntity } from '~/domain/index.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface SlugEntityJson extends EntityJson {
    name: string;
    description: string;
}

export default class SlugEntityToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: SlugEntityJson): SlugEntity {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new SlugEntity(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: SlugEntity): SlugEntityJson {
        return {
            ...super.mapTo(source),
            name: source.name,
            description: source.description
        };
    }
}