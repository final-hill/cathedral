import { System } from '~/domain/index.mjs';
import type { EntityJson } from './EntityToJsonMapper.mjs';
import EntityToJsonMapper from './EntityToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';
import ComponentToJsonMapper, { type ComponentJson } from './ComponentToJsonMapper.mjs';

export interface SystemJson extends EntityJson {
    components: ComponentJson[];
}
export interface SystemJson extends EntityJson {
    components: ComponentJson[];
}

export default class SystemToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: SystemJson): System {
        const sVer = target.serializationVersion,
            version = new SemVer(sVer),
            componentToJsonMapper = new ComponentToJsonMapper(sVer);

        if (version.gte('0.5.0'))
            return new System({
                ...super.mapFrom(target),
                components: (target.components ?? []).map(item => componentToJsonMapper.mapFrom(item))
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: System): SystemJson {
        const sVer = this.serializationVersion,
            componentToJsonMapper = new ComponentToJsonMapper(sVer);

        return {
            ...super.mapTo(source),
            components: source.components.map(item => componentToJsonMapper.mapTo(item))
        };
    }
}