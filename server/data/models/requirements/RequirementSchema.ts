import { EntitySchema } from '@mikro-orm/core';
import { AppUser } from '../../../../domain/application/index.js';
import { Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const RequirementSchema = new EntitySchema<Requirement>({
    class: Requirement,
    abstract: true,
    discriminatorColumn: 'req_type',
    discriminatorValue: ReqType.REQUIREMENT,
    properties: {
        id: { type: 'uuid', primary: true },
        reqId: { type: 'text', nullable: true },
        req_type: { enum: true, items: () => ReqType },
        name: { type: 'string', length: 100 },
        description: { type: 'string', length: 1000 },
        lastModified: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date(), defaultRaw: 'now()' },
        modifiedBy: { kind: 'm:1', entity: () => AppUser },
        createdBy: { kind: 'm:1', entity: () => AppUser },
        isSilence: { type: 'boolean', default: false },

        // Relations

        belongs: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Belongs', inversedBy: 'contains' },
        contains: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Belongs', mappedBy: 'belongs' },

        characterizes: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Characterizes', inversedBy: 'characterizedBy' },
        characterizedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Characterizes', mappedBy: 'characterizes' },

        constrains: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Constrains', inversedBy: 'constrainedBy' },
        constrainedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Constrains', mappedBy: 'constrains' },

        contradicts: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Contradicts', inversedBy: 'contradictedBy' },
        contradictedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Contradicts', mappedBy: 'contradicts' },

        details: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Details', inversedBy: 'detailedBy' },
        detailedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Details', mappedBy: 'details' },

        disjoins: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Disjoins', inversedBy: 'disjoinedBy' },
        disjoinedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Disjoins', mappedBy: 'disjoins' },

        duplicates: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Duplicates', inversedBy: 'duplicatedBy' },
        duplicatedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Duplicates', mappedBy: 'duplicates' },

        excepts: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Excepts', inversedBy: 'exceptedBy' },
        exceptedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Excepts', mappedBy: 'excepts' },

        explains: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Explains', inversedBy: 'explainedBy' },
        explainedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Explains', mappedBy: 'explains' },

        extends: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Extends', inversedBy: 'extendedBy' },
        extendedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Extends', mappedBy: 'extends' },

        follows: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Follows', inversedBy: 'followedBy' },
        followedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Follows', mappedBy: 'follows' },

        repeats: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Repeats', inversedBy: 'repeatedBy' },
        repeatedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Repeats', mappedBy: 'repeats' },

        shares: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Shares', inversedBy: 'sharedBy' },
        sharedBy: { kind: 'm:n', entity: 'Requirement', pivotEntity: 'Shares', mappedBy: 'shares' },
    }
})