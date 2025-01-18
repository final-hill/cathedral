/**
 * Represents the metadata of an entity that is used to track the creation and modification of the entity
 */
export abstract class AuditMetadata {
    constructor(props: Pick<AuditMetadata, keyof AuditMetadata>) {
        this.createdById = props.createdById;
        this.creationDate = props.creationDate;
        this.isDeleted = props.isDeleted
        this.lastModified = props.lastModified;
        this.modifiedById = props.modifiedById;
    }

    /**
     * The user who created the entity
     */
    readonly createdById: string;

    /**
     * The date and time when the entity was created
     */
    readonly creationDate: Date

    /**
     * Whether the entity is deleted
     */
    readonly isDeleted: boolean;

    /**
     * The date and time when the entity was last modified
     */
    readonly lastModified: Date;

    /**
     * The user who last modified the entity
     */
    readonly modifiedById: string;

}