import Component from "~/domain/Component";
import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";

export interface ComponentJson extends RequirementJson { }

export default class ComponentToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: Component): ComponentJson {
        return {
            ...super.mapTo(source)
        };
    }

    override mapFrom(target: ComponentJson): Component {
        return new Component({
            ...super.mapFrom(target)
        });
    }
}