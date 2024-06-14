import type UserStory from "../domain/UserStory";
import StorageRepository from "~/data/StorageRepository";
import type { Properties } from "~/domain/Properties";
import UserStoryToJsonMapper from "../mappers/UserStoryToJsonMapper";

const { serializationVersion } = useAppConfig()

export default class UserStoryRepository extends StorageRepository<UserStory> {
    constructor(properties: Properties<Omit<UserStoryRepository, 'storageKey' | 'mapper'>> = {}) {
        super({
            ...properties,
            storageKey: 'userStory',
            mapper: new UserStoryToJsonMapper(serializationVersion)
        })
    }
}