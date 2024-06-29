import Component from "~/domain/Component";
import PGLiteEntityRepository from "./PGLiteEntityRepository";

export default class ComponentRepository extends PGLiteEntityRepository<Component> {
    constructor() { super('cathedral.component', Component) }
}