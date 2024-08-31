import { EntitySchema } from "@mikro-orm/core";
import ScenarioSchema from "./ScenarioSchema.js";
import { Scenario, UseCase } from "../../domain/requirements/index.js";

export default new EntitySchema<UseCase, Scenario>({
    class: UseCase,
    extends: ScenarioSchema,
    properties: {
        scope: { type: 'string', nullable: false },
        level: { type: 'string', nullable: false },
        goalInContext: { type: 'string', nullable: false },
        precondition: { kind: 'm:1', entity: 'Assumption', nullable: false },
        triggerId: { type: 'uuid', nullable: false },
        mainSuccessScenario: { type: 'string', nullable: false },
        successGuarantee: { kind: 'm:1', entity: 'Effect', nullable: false },
        extensions: { type: 'string', nullable: false },
    }
})