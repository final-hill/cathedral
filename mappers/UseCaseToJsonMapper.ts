import type { Uuid } from "~/domain/Uuid";
import type { RequirementJson } from "~/mappers/RequirementToJsonMapper";
import RequirementToJsonMapper from "~/mappers/RequirementToJsonMapper";
import SemVer from "~/domain/SemVer";
import UseCase from "~/domain/UseCase";

export interface UseCaseJson extends RequirementJson {
    primaryActorId: Uuid
}

export default class UseCaseToJsonMapper extends RequirementToJsonMapper {
    mapFrom(target: UseCaseJson): UseCase {
        const version = new SemVer(target.serializationVersion);

        return new UseCase({
            parentId: target.parentId,
            id: target.id,
            name: target.name,
            primaryActorId: target.primaryActorId,
            property: target.property,
            statement: target.statement,
        })
    }

    mapTo(source: UseCase): UseCaseJson {
        return {
            ...super.mapTo(source as any),
            primaryActorId: source.primaryActorId,
        }
    }
}