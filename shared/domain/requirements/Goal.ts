import { dedent } from "#shared/utils";
import { z } from "zod";
import { ReqType } from "./ReqType.js";
import { Requirement } from "./Requirement.js";

export const Goal = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.GOAL)
}).describe(dedent(`
    A result desired by an organization
    an objective of the project or system, in terms
    of their desired effect on the environment
`))