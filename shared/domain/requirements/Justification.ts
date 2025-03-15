import { dedent } from "../../../shared/utils/dedent.js";
import { z } from "zod";
import { MetaRequirement } from "./MetaRequirement.js";
import { ReqType } from "./ReqType.js";

export const Justification = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.JUSTIFICATION)
}).describe(dedent(`
    Explanation of a project or system property in reference to a goal or environment property
    A requirement is justified if it helps to achieve a goal or to satisfy an environment property (constraint)
`))