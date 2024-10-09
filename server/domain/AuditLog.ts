import { v7 as uuidv7 } from 'uuid';
import { ChangeSetType, Entity, Enum, Property } from "@mikro-orm/core";

@Entity()
export class AuditLog {
    constructor(props: Omit<AuditLog, 'id' | 'createdAt'>) {
        this.type = props.type;
        this.entity = props.entity;
    }

    /**
     * The unique identifier of the AuditLog
     */
    @Property({ type: 'uuid', primary: true })
    id: string = uuidv7();

    @Enum(() => ChangeSetType)
    type: ChangeSetType

    @Property({ type: 'json', nullable: true })
    entity: string

    @Property({ type: 'datetime' })
    createdAt: Date = new Date();
}