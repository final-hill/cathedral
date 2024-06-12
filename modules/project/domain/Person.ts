import Actor from "~/domain/Actor";
import type { Properties } from "~/domain/Properties";
import type { Uuid } from "~/domain/Uuid";

export default class Person extends Actor {
    constructor({ email, roleId, projectId, ...rest }: Properties<Person>) {
        super(rest);

        Object.assign(this, { email, roleId, projectId });
    }

    email!: string;
    roleId!: Uuid;
    projectId!: Uuid;
}