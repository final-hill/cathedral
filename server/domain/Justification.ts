import { Entity, ManyToOne } from "@mikro-orm/core";
import { MetaRequirement, ParsedRequirement } from "./index.js";

/**
 * Explanation of a project or system property in reference to a goal or environment property
 */
@Entity()
class Justification extends MetaRequirement {
    constructor({ follows, ...rest }: Omit<Justification, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this justification follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { Justification };