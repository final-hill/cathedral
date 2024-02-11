import SemVer from '~/lib/SemVer.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import { GlossaryTerm } from '~/domain/index.mjs';

export interface GlossaryTermJson extends EntityJson {
    term: string;
    definition: string;
}

export default class GlossaryTermToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: GlossaryTermJson): GlossaryTerm {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new GlossaryTerm(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: GlossaryTerm): GlossaryTermJson {
        return {
            ...super.mapTo(source),
            term: source.term,
            definition: source.definition
        };
    }
}