import type Equatable from "./Equatable";

/**
 * A value object is an object that contains attributes but has no conceptual identity.
 */
export default class ValueObject implements Equatable {
    equals(other: this): boolean {
        return Object.keys(this).every(key => {
            const value = (this as any)[key],
                otherValue = (other as any)[key];
            if ('equals' in value)
                return value.equals(otherValue);

            return value === otherValue;
        });
    }
}