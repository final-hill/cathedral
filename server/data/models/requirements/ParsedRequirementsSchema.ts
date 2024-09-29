import { EntitySchema } from "@mikro-orm/core";
import { ParsedRequirements } from "../../../domain/application/index.js";

export default new EntitySchema<ParsedRequirements>({
    class: ParsedRequirements,
    properties: {
        id: { type: 'uuid', primary: true },
        solution: { kind: 'm:1', entity: 'Solution' },
        statement: { type: 'string', length: 1000, nullable: false },
        submittedBy: { kind: 'm:1', entity: 'AppUser', nullable: false },
        submittedAt: { type: 'datetime', nullable: false, defaultRaw: 'now()' },
        jsonResult: { type: 'json', nullable: true },
    }
})