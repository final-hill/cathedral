import { type EventSubscriber, type FlushEventArgs } from "@mikro-orm/core";
import { AuditLog } from "../../domain/AuditLog.js";

/**
 * The AuditSubscriber class is responsible for
 * tracking changes to entities in the database.
 * @see https://github.com/mikro-orm/mikro-orm/issues/637
 * @see https://mikro-orm.io/docs/events#eventsubscriber
 */
export default class AuditSubscriber implements EventSubscriber {
    async onFlush(args: FlushEventArgs): Promise<void> {
        await Promise.all(
            args.uow.getChangeSets()
                // Don't log the log...
                .filter(cs => !(cs.entity instanceof AuditLog))
                .map(async (changeSet) => {
                    const auditLog = new AuditLog({
                        type: changeSet.type,
                        entity: JSON.stringify(changeSet.entity)
                    });

                    args.uow.computeChangeSet(auditLog)
                })
        )
    }
}