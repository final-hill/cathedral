import type { Properties } from "~/domain/Properties";
import GoalToJsonMapper from "../mappers/GoalToJsonMapper";
import StorageRepository from "~/data/StorageRepository";
import type Goal from "../domain/Goal";

const { serializationVersion } = useAppConfig()

export default class GoalRepository extends StorageRepository<Goal> {
    constructor(properties: Properties<Omit<GoalRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'goal',
            mapper: new GoalToJsonMapper(serializationVersion)
        })
    }
}