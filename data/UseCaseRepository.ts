import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import UseCase from "../domain/UseCase";

export default class UseCaseRepository extends PGLiteEntityRepository<UseCase> {
    constructor() { super('cathedral.use_case', UseCase); }
}