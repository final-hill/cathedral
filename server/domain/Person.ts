import Actor from "~/server/domain/Actor";
import type { Properties } from "~/server/domain/Properties";

export default class Person extends Actor {
    constructor({ email, ...rest }: Properties<Person>) {
        super(rest);

        Object.assign(this, { email });
    }

    email!: string;

    override toJSON() {
        return {
            ...super.toJSON(),
            email: this.email
        };
    }
}