import { Entity, Property } from "@mikro-orm/core";
import slugify from "../../shared/slugify.js";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * An Organization is a collection of people and solutions
 */
@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class Organization extends Requirement {
    constructor(props: Properties<Omit<Organization, 'id' | 'slug' | 'req_type'>>) {
        super(props)
        this.slug = slugify(props.name);
        this.req_type = ReqType.ORGANIZATION;
    }

    /**
     * A slugified version of the name
     */
    @Property({ type: 'string', unique: true })
    slug: string;
}