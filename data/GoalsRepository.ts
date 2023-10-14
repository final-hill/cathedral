import { Goals } from "~/domain/Goals";
import { GoalsJsonMapper } from "~/mappers/GoalsJsonMapper";
import { Repository } from "~/usecases/Repository";

export class GoalsRepository extends Repository<Goals> {
    constructor() {
        super('goals', new GoalsJsonMapper())
    }
}