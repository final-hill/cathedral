import type { Properties } from "./Properties";
import type { Uuid } from "./Uuid";
import ValueObject from "./ValueObject";

export default class ComponentFunctionality extends ValueObject {
    solutionId: Uuid;
    componentId: Uuid;
    functionalityId: Uuid;

    constructor({ solutionId, componentId, functionalityId }: Properties<ComponentFunctionality>) {
        super()

        this.solutionId = solutionId
        this.componentId = componentId;
        this.functionalityId = functionalityId;
    }
}