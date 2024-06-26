import AppUser from "~/domain/AppUser";
import PGLiteRepository from "./PGLiteRepository";

export default class AppUserRepository extends PGLiteRepository<AppUser> {
    constructor() { super('cathedral.app_user', AppUser) }
}