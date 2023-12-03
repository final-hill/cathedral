import { Environment } from "~/domain/Environment.mjs";
import { PEGSRepository } from "./PEGSRepository.mjs";

export class EnvironmentRepository extends PEGSRepository<Environment> {
    constructor() { super('environments', Environment); }
}