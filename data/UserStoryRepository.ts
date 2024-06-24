import UserStory from "~/domain/UserStory";
import PGLiteRepository from "./PGLiteRepository";

export default class UserStoryRepository extends PGLiteRepository<UserStory> {
    constructor() {
        super('cathedral.user_story', UserStory)
    }
}