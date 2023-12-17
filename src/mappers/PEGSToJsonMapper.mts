import PEGS from '~/domain/PEGS.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';

export interface PEGSJson extends EntityJson {
    name: string;
    description: string;
}

export default class PEGSToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: PEGSJson): PEGS {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new PEGS(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }
    override mapTo(source: PEGS): PEGSJson {
        return {
            ...super.mapTo(source),
            name: source.name,
            description: source.description
        };
    }
}