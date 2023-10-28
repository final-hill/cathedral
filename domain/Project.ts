import { PEGS } from "./PEGS";

/**
 * A Project is the set of human processes involved in the planning,
 * construction, revision, and operation of an associated system.
 */
export class Project extends PEGS {
    static override STORAGE_KEY = 'projects';

    static override fromJSON(json: any): Project {
        return new Project({
            id: json.id,
            description: json.description,
            name: json.name
        })
    }

    override toJSON(): any {
        return {
            ...super.toJSON()
        }
    }
}