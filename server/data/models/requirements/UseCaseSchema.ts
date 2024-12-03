import { EntitySchema } from '@mikro-orm/core';
import { UseCase, ReqType, Scenario } from '../../../../domain/requirements/index.js';

export const UseCaseSchema = new EntitySchema<UseCase, Scenario>({
    class: UseCase,
    discriminatorValue: ReqType.USE_CASE,
    properties: {
        scope: { type: 'string' },
        level: { type: 'string' },
        precondition: { kind: 'm:1', entity: 'Assumption' },
        triggerId: { type: 'uuid' },
        mainSuccessScenario: { type: 'string' },
        successGuarantee: { kind: 'm:1', entity: 'Effect' },
        extensions: { type: 'string' }
    }
})