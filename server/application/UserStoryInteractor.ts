import Interactor from "~/server/application/Interactor";
import UserStory from "~/server/domain/UserStory";
import Repository from "./Repository";

export default class UserStoryInteractor extends Interactor<UserStory> {
    constructor(repository: Repository<UserStory>) {
        super(repository, UserStory)
    }
}