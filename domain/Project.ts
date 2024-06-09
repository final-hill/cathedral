import PEGS from "./PEGS";
import type System from "./System";
import type Task from "./Task";
import type { Properties } from "./Properties";

/**
 * The set of human processes involved in the plannimg, construction,
 * revision, and operation of a system
 */
export class Project extends PEGS {
    system!: System
    tasks!: Task[]

    constructor({ system, tasks, ...rest }: Properties<Project>) {
        super(rest)

        this.system = system
        this.tasks = tasks
    }
}
