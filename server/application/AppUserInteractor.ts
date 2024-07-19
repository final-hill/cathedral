import Interactor from "~/server/application/Interactor";
import Repository from "./Repository";
import AppUser from "../domain/application/AppUser";
import { Properties } from "../domain/Properties";

export default class AppUserInteractor extends Interactor<AppUser> {
    constructor(repository: Repository<AppUser>) {
        super(repository, AppUser)
    }

    override async create(item: Properties<AppUser>): Promise<AppUser['id']> {
        return await this.repository.add(item)
    }
}