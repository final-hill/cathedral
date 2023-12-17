import type { Uuid } from '~/types/Uuid.mjs';
import PEGSToJsonMapper, { type PEGSJson } from './PEGSToJsonMapper.mjs';
import Environment from '~/domain/Environment.mjs';

export interface EnvironmentJson extends PEGSJson {
    glossary: Uuid[];
}

export default class EnvironmentToJsonMapper extends PEGSToJsonMapper {
    override mapFrom(target: EnvironmentJson): Environment {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Environment(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Environment): EnvironmentJson {
        return {
            ...super.mapTo(source),
            glossary: source.glossary
        };
    }
}