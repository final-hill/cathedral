import { Environment } from "~/domain/Environment";
import { Repository } from "~/usecases/Repository";
import { EnvironmentJsonMapper } from "~/mappers/EnvironmentJsonMapper";

export class EnvironmentRepository extends Repository<Environment> {
    constructor() {
        super('environments', new EnvironmentJsonMapper())
    }
}