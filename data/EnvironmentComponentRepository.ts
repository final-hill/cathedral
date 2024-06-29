import PGLiteEntityRepository from "./PGLiteEntityRepository";
import EnvironmentComponent from "~/domain/EnvironmentComponent";

export default class EnvironmentComponentRepository extends PGLiteEntityRepository<EnvironmentComponent> {
    constructor() { super('cathedral.environment_component', EnvironmentComponent) }
}