import type { Properties } from "./Properties";
import Requirement from "./Requirement";

export class Relation extends Requirement {
    constructor({ left, right, ...rest }: Properties<Relation>) {
        super(rest);

        this.left = left;
        this.right = right;
    }

    left: Requirement;
    right: Requirement;
}
/*
 * X and Y are unrelated
 */
export class Disjoins extends Relation { }
/**
 * X is a sub-requirement of Y
 */
export class Belongs extends Relation { }
/**
 * X specifies the same property as Y
 */
export class Repeats extends Relation { }
/**
 * X specifies a property in a way not compatible with Y
 */
export class Contradicts extends Relation { }
/**
 * The property specified by X is a consequence of the property specified by Y
 */
export class Follows extends Relation { }
/**
 * X assumes Y and specifies a property not specified by Y.
 * aka "refines"
 */
export class Extends extends Relation { }
/**
 * X changes or removes, for a specified case, a property specified by Y
 */
export class Excepts extends Relation { }
/**
 * X specifies a constraint on a property specified by Y
 */
export class Constrains extends Relation { }
/**
 * X is a meta-requirement involving Y
 */
export class Characterizes extends Relation { }
/**
 * X adds detail to a property specified by Y
 */
export class Details extends Extends { }
/**
 * X' <=> Y' for some subrequirements X' and Y' of X and Y
 * Some subrequirements of X and Y are common
 */
export class Shares extends Repeats { }
/**
 * X <=> Y, and X has the same type as Y
 * Same properties and same type (notation)
 */
export class Duplicates extends Repeats { }
/**
 * X <=> Y, and X has a different type than Y
 * Same properties but different type
 */
export class Explains extends Repeats { }
