import { Requirement } from "./Requirement.js";
import { MoscowPriority } from "./MoscowPriority.js";
import { z } from 'zod';
import { ReqType } from "./ReqType.js";

export const Behavior = Requirement.extend({
    priority: z.nativeEnum(MoscowPriority).describe('The Moscow Priority of the behavior'),
    reqType: z.nativeEnum(ReqType).default(ReqType.BEHAVIOR)
}).describe('A Behavior is a property of the operation of the system');