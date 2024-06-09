import Entity from "./Entity";
import type { Properties } from "./Properties";
import type { Uuid } from "./Uuid";

export default class PEGS extends Entity {
    constructor({ id, ...rest }: Properties<PEGS>) {
        super({ id })

        Object.assign(this, rest)
    }

    solutionId!: Uuid
    componentIds!: Uuid[]
    limitationIds!: Uuid[]
}
