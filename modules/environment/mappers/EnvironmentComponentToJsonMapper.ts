import Component from "~/domain/Component";
import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";

export interface EnvironmentComponentJson extends RequirementJson { }

export default class EnvironmentComponentToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: Component): EnvironmentComponentJson {
        return {
            ...super.mapTo(source)
        };
    }

    override mapFrom(target: EnvironmentComponentJson): Component {
        return new Component({
            ...super.mapFrom(target)
        });
    }
}