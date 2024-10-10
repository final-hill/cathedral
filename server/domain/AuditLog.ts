import { v7 as uuidv7 } from 'uuid';
import { ChangeSetType, Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { Solution } from './Solution.js';

/**
 * The AuditLog class is responsible for tracking changes to entities in the database.
 */
@Entity()
export class AuditLog {
    constructor(props: Omit<AuditLog, 'id' | 'createdAt'>) {
        this.type = props.type;
        this.entity = props.entity;
        this.entityId = props.entityId;
        this.entityName = props.entityName;
    }

    /**
     * The unique identifier of the AuditLog
     */
    @Property({ type: 'uuid', primary: true })
    id: string = uuidv7();

    /**
     * The unique identifier of the entity that was changed
     */
    @Property({ type: 'uuid' })
    entityId: string

    /**
     * The name of the entity that was changed
     */
    @Property({ type: 'string' })
    entityName: string

    /**
     * The type of change that was made
     */
    @Enum(() => ChangeSetType)
    type: ChangeSetType

    /**
     * The entity that was changed
     */
    @Property({ type: 'json', nullable: true })
    entity: string

    /**
     * The date and time when the AuditLog was created
     */
    @Property({ type: 'datetime' })
    createdAt: Date = new Date();
}