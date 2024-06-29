import UserStory from "~/domain/UserStory";
import PGLiteEntityRepository from "./PGLiteEntityRepository";

export default class UserStoryRepository extends PGLiteEntityRepository<UserStory> {
    constructor() { super('cathedral.user_story', UserStory) }
}