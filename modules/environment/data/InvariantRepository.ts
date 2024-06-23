import PGLiteRepository from "~/data/PGLiteRepository";
import Invariant from "../domain/Invariant";

export default class InvariantRepository extends PGLiteRepository<Invariant> {
    constructor() { super('cathedral.invariant', Invariant) }
}