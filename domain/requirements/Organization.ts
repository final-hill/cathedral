import { Entity, Property } from "@mikro-orm/core";
import slugify from "../../shared/slugify.js";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * An Organization is a collection of users and solutions
 */
@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class Organization extends Requirement {
    static override req_type: ReqType = ReqType.ORGANIZATION

    constructor(props: Properties<Omit<Organization, 'id' | 'slug' | 'req_type'>>) {
        super(props)
        this._slug = slugify(props.name);
    }

    override set name(value: string) {
        super.name = value;
        this._slug = slugify(value);
    }

    private _slug!: string;

    /**
     * A slugified version of the name
     */
    @Property({ type: 'string', unique: true })
    get slug(): string { return this._slug; }
    set slug(value: string) {
        if (value !== slugify(this.name))
            throw new Error('Slug must be a slugified version of the name');
        this._slug = value;
    }
}