import { Goals } from "~/domain/Goals";
import { PegsRepository } from "./PegsRepository";

export class GoalsRepository extends PegsRepository<Goals> {
    constructor() { super(Goals) }
}