import PEGS from '~/domain/PEGS.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface PEGSJson extends EntityJson {
    name: string;
    description: string;
}

export default class PEGSToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: PEGSJson): PEGS {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
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