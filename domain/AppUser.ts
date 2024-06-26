import Entity from "./Entity";
import type { Properties } from "./Properties";

export default class AppUser extends Entity<string> {
    constructor({ name, displayName, publicKey, ...rest }: Properties<AppUser>) {
        super(rest)

        this.name = name
        this.displayName = displayName
        this.publicKey = publicKey
    }

    name: string
    displayName: string
    publicKey: string
}