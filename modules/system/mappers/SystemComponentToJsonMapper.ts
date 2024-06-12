import type { Uuid } from "~/domain/Uuid";
import SystemComponent from "../domain/SystemComponent";
import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";

export interface SystemComponentJson extends RequirementJson {
    systemId: Uuid;
}

export default class SystemComponentToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: SystemComponent): SystemComponentJson {
        return {
            ...super.mapTo(source),
            systemId: source.systemId
        };
    }

    override mapFrom(target: SystemComponentJson): SystemComponent {
        return new SystemComponent({
            ...super.mapFrom(target),
            systemId: target.systemId
        });
    }
}