import { Behavior } from "~/domain/Behavior.mjs";
import { LocalStorageRepository } from "./LocalStorageRepository.mjs";

export class BehaviorRepository extends LocalStorageRepository<Behavior> {
    constructor() { super('behavior', Behavior); }
}