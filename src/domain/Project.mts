import { PEGS, type PEGSJson } from './PEGS.mjs';

export interface ProjectJson extends PEGSJson { }

/**
 * A Project is the set of human processes involved in the planning,
 * construction, revision, and operation of an associated system.
 * @extends PEGS
 */
export class Project extends PEGS {
    static override fromJSON({ id, description, name }: ProjectJson): Project {
        return new Project({ id, description, name });
    }

    override toJSON(): ProjectJson {
        return {
            ...super.toJSON()
        };
    }
}