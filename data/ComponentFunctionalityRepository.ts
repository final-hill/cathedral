import ComponentFunctionality from "~/domain/ComponentFunctionality";
import PGLiteValueRepository from "./PGLiteValueRepository";

export default class ComponentFunctionalityRepository extends PGLiteValueRepository<ComponentFunctionality> {
    constructor() { super('cathedral.component_functionality', ComponentFunctionality) }
}