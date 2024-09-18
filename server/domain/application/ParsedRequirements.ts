import { v7 as uuidv7 } from 'uuid';
import type { Properties } from '../Properties.js';
import { AppUser, Solution } from './index.js';

/**
 * Requirements that have been parsed from a submitted statement.
 */
export class ParsedRequirements {
    constructor(props: Omit<Properties<ParsedRequirements>, 'id'>) {
        this.id = uuidv7();
        Object.assign(this, props);
    }

    id: string
    solution!: Solution;
    statement!: string;
    submittedBy!: AppUser;
    submittedAt!: Date;
    jsonResult!: { requirements: { type: string }[] } | null;

    toJSON() {
        return {
            id: this.id,
            solution: this.solution.id,
            statement: this.statement,
            submittedBy: this.submittedBy.id,
            submittedAt: this.submittedAt,
            jsonResult: this.jsonResult
        }
    }
}