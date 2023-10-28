import { Environment } from "~/domain/Environment";
import { PegsRepository } from "./PegsRepository";

export class EnvironmentRepository extends PegsRepository<Environment> {
    constructor() { super(Environment) }
}