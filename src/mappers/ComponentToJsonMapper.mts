import SemVer from '~/lib/SemVer.mjs';
import type { RequirementJson } from './RequirementToJsonMapper.mjs';
import RequirementToJsonMapper from './RequirementToJsonMapper.mjs';
import Component from '~/domain/Component.mjs';

export interface ComponentJson extends RequirementJson {
    name: string;
    description: string;
}

export default class ComponentToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: ComponentJson): Component {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new Component(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Component): ComponentJson {
        return {
            ...super.mapTo(source),
            name: source.name,
            description: source.description,
        };
    }
}