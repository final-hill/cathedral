import { Invariant } from '~/domain/index.mjs';
import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface InvariantJson extends RequirementJson { }

export default class InvariantToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: InvariantJson): Invariant {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new Invariant(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Invariant): InvariantJson {
        return super.mapTo(source);
    }
}