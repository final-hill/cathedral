import { v7 as uuidv7 } from 'uuid';
import { BaseEntity, ChangeSetType, Entity, Enum, Property } from "@mikro-orm/core";
import { type Properties } from '../types/index.js';

/**
 * The AuditLog class is responsible for tracking changes to entities in the database.
 */
@Entity()
export class AuditLog extends BaseEntity {
    constructor(props: Properties<Omit<AuditLog, 'id' | 'createdAt'>> & { id?: string, createdAt?: Date }) {
        super()
        this.type = props.type;
        this.entity = props.entity;
        this.entityId = props.entityId;
        this.entityName = props.entityName;
        this.createdAt = props.createdAt || new Date();
        this.id = props.id || uuidv7();
    }

    /**
     * The unique identifier of the AuditLog
     */
    @Property({ type: 'uuid', primary: true })
    id: string

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
    @Property({ type: 'json' })
    entity: string

    /**
     * The date and time when the AuditLog was created
     */
    @Property({ type: 'datetime' })
    createdAt: Date
}