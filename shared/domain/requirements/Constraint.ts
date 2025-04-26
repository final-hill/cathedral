import { Requirement } from './Requirement.js';
import { ConstraintCategory } from './ConstraintCategory.js';
import { z } from 'zod';
import { dedent } from '../../../shared/utils/dedent.js';
import { ReqType } from './ReqType.js';

export const Constraint = Requirement.extend({
    category: z.nativeEnum(ConstraintCategory)
        .describe('Category of the constraint'),
    reqId: z.string().regex(/^E\.3\.\d+$/, 'Format must be E.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.3.').default('E.3.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.CONSTRAINT)
}).describe(dedent(`
    Constraints are the limitations and obligations that
    the environment imposes on the project and system.
`));