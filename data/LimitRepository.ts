import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import Limit from "../domain/Limit";

export default class LimitRepository extends PGLiteEntityRepository<Limit> {
    // "limit" is a reserved word in SQL, so we need to use quotes to escape it
    constructor() { super(`cathedral."limit"`, Limit) }
}