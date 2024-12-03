import { EntitySchema } from '@mikro-orm/core';
import { RequirementRelation } from '../../../../domain/relations/index.js'

export const RequirementRelationSchema = new EntitySchema<RequirementRelation>({
    class: RequirementRelation,
    discriminatorColumn: 'rel_type',
    abstract: true,
    properties: {
        left: { kind: 'm:1', primary: true, entity: 'Requirement' },
        right: { kind: 'm:1', primary: true, entity: 'Requirement' }
    }
});