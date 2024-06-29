import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import Invariant from "../domain/Invariant";

export default class InvariantRepository extends PGLiteEntityRepository<Invariant> {
    constructor() { super('cathedral.invariant', Invariant) }
}