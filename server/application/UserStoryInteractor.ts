import Interactor from "~/server/application/Interactor";
import UserStory from "~/server/domain/requirements/UserStory";
import Repository from "./Repository";

export default class UserStoryInteractor extends Interactor<UserStory> {
    constructor(repository: Repository<UserStory>) {
        super(repository, UserStory)
    }
}