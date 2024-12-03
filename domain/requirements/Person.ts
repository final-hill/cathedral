import { Actor } from "./Actor.js";
import { ReqType } from "./ReqType.js";

/**
 * A person is a member of the Project staff
 */
export class Person extends Actor {
    static override req_type: ReqType = ReqType.PERSON;
    static override reqIdPrefix = 'P.1.' as const;

    constructor({ email, ...rest }: ConstructorParameters<typeof Actor>[0] & Pick<Person, 'email'>) {
        super(rest);
        this.email = email;
    }

    override get reqId() { return super.reqId as `${typeof Person.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }

    private _email?: string;

    /**
     * Email address of the person
     */
    // email address: https://stackoverflow.com/a/574698
    get email(): string | undefined { return this._email; }
    set email(value: string | undefined) {
        if (value && !value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
            throw new Error('Invalid email address');
        if (value && value.length > 254)
            throw new Error('Email address too long');
        this._email = value;
    }
}