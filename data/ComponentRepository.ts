import Component from "~/domain/Component";
import PGLiteRepository from "./PGLiteRepository";

export default class ComponentRepository extends PGLiteRepository<Component> {
    constructor() { super('cathedral.component', Component) }
}