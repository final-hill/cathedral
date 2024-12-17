import { Actor } from "./Actor.js";

/**
 * A person is a member of the Project staff
 */
export class Person extends Actor {
    static override readonly reqIdPrefix = 'P.1.' as const;

    constructor({ email, ...rest }: ConstructorParameters<typeof Actor>[0] & Pick<Person, 'email'>) {
        super(rest);
        // email address: https://stackoverflow.com/a/574698
        if (email && !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
            throw new Error('Invalid email address');
        if (email && email.length > 254)
            throw new Error('Email address too long');
        this.email = email;
    }

    override get reqId() { return super.reqId as `${typeof Person.reqIdPrefix}${number}` | undefined }

    /**
     * Email address of the person
     */
    readonly email?: string;
}