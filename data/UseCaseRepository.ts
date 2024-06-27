import PGLiteRepository from "~/data/PGLiteRepository";
import UseCase from "../domain/UseCase";

export default class UseCaseRepository extends PGLiteRepository<UseCase> {
    constructor() { super('cathedral.use_case', UseCase); }
}