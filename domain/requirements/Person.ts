import { Entity, Property } from "@mikro-orm/core";
import { Actor } from "./Actor.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A person is a member of the Project staff
 */
@Entity({ discriminatorValue: ReqType.PERSON })
export class Person extends Actor {
    static override req_type: ReqType = ReqType.PERSON;
    static override reqIdPrefix = 'P.1.' as const;

    constructor({ email, ...rest }: Properties<Omit<Person, 'id' | 'req_type'>>) {
        super(rest);
        this.email = email;
    }

    override get reqId() { return super.reqId as `${typeof Person.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }

    /**
     * Email address of the person
     */
    // email address: https://stackoverflow.com/a/574698
    @Property({ type: 'string', length: 254 })
    email?: string;
}