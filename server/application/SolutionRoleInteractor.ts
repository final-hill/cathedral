import Interactor from "~/server/application/Interactor";
import Repository from "./Repository";
import SolutionRole from "../domain/application/SolutionRole";
import { type Properties } from "../domain/Properties";

export default class SolutionRoleInteractor extends Interactor<SolutionRole> {
    constructor(repository: Repository<SolutionRole>) {
        super(repository, SolutionRole)
    }

    override async create(item: Properties<SolutionRole>): Promise<SolutionRole['id']> {
        return await this.repository.add(item)
    }
}