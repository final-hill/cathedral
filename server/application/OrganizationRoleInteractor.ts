import Interactor from "~/server/application/Interactor";
import Repository from "./Repository";
import OrganizationRole from "../domain/application/OrganizationRole";
import { type Properties } from "../domain/Properties";

export default class OrganizationRoleInteractor extends Interactor<OrganizationRole> {
    constructor(repository: Repository<OrganizationRole>) {
        super(repository, OrganizationRole)
    }

    override async create(item: Properties<OrganizationRole>): Promise<OrganizationRole['id']> {
        return await this.repository.add(item)
    }
}