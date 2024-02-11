import SemVer from '~/lib/SemVer.mjs';
import type { RequirementJson } from './RequirementToJsonMapper.mjs';
import RequirementToJsonMapper from './RequirementToJsonMapper.mjs';
import { Component } from '~/domain/index.mjs';

export interface ComponentJson extends RequirementJson {
    name: string;
    children: ComponentJson[];
}

export default class ComponentToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: ComponentJson): Component {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new Component({
                ...super.mapFrom(target),
                name: target.name,
                children: (target.children ?? []).map(item => this.mapFrom(item)),
                statement: target.statement
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Component): ComponentJson {
        return {
            ...super.mapTo(source),
            name: source.name,
            children: source.children.map(item => this.mapTo(item))
        };
    }
}