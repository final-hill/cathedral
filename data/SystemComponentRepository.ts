import SystemComponent from "~/domain/SystemComponent";
import PGLiteEntityRepository from "./PGLiteEntityRepository";

export default class SystemComponentRepository extends PGLiteEntityRepository<SystemComponent> {
    constructor() { super('cathedral.system_component', SystemComponent) }
}