import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import Person from "../domain/Person";
import type { Uuid } from "~/domain/Uuid";

export interface PersonJson extends RequirementJson {
    email: string;
    roleId: Uuid;
    projectId: Uuid;
}

export default class PersonToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: PersonJson): Person {
        return new Person({
            ...super.mapFrom(target),
            email: target.email,
            roleId: target.roleId,
            projectId: target.projectId
        })
    }

    override mapTo(source: Person): PersonJson {
        const requirement = super.mapTo(source)

        return {
            ...requirement,
            email: source.email,
            roleId: source.roleId,
            projectId: source.projectId
        }
    }
}