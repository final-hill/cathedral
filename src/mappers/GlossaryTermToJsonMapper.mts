import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import GlossaryTerm from '~/domain/GlossaryTerm.mjs';

export interface GlossaryTermJson extends EntityJson {
    term: string;
    definition: string;
}

export default class GlossaryTermToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: GlossaryTermJson): GlossaryTerm {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
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