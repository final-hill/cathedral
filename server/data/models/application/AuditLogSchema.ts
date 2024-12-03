import { ChangeSetType, EntitySchema } from "@mikro-orm/core";
import { AuditLog } from "../../../../domain/application/index.js";

export const AuditLogSchema = new EntitySchema<AuditLog>({
    class: AuditLog,
    properties: {
        id: { type: 'uuid', primary: true },
        entityId: { type: 'uuid' },
        entityName: { type: 'string' },
        type: { enum: true, items: () => ChangeSetType },
        entity: { type: 'json' },
        createdAt: { type: 'datetime' }
    }
})