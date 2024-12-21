import { slugify } from "../../shared/utils/slugify.js";
import { Requirement } from "./Requirement.js";

/**
 * An Organization is a collection of users and solutions
 */
export class Organization extends Requirement {
    constructor(props: ConstructorParameters<typeof Requirement>[0] & Pick<Organization, 'appUserIds'>) {
        super(props)
        this.slug = slugify(props.name);
        this.appUserIds = [...props.appUserIds]
    }

    /**
     * A slugified version of the name
     */
    readonly slug!: string;

    /**
     * The users that are part of this organization
     */
    readonly appUserIds: string[];
}