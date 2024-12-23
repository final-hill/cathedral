import { slugify } from "../../shared/utils/slugify.js";
import { Requirement } from "./Requirement.js";

/**
 * An Organization is a collection of users and solutions
 */
export class Organization extends Requirement {
    constructor(props: ConstructorParameters<typeof Requirement>[0]) {
        super(props)
        this.slug = slugify(props.name);
    }

    /**
     * A slugified version of the name
     */
    readonly slug!: string;
}