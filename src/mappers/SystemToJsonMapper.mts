import System from '~/domain/System.mjs';
import type { EntityJson } from './EntityToJsonMapper.mjs';
import EntityToJsonMapper from './EntityToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface SystemJson extends EntityJson { }

export default class SystemToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: SystemJson): System {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new System(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: System): SystemJson {
        return super.mapTo(source);
    }
}