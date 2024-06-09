export type SemVerString = `${number}.${number}.${number}`;

/**
 * A simple class to represent a semantic version of the form `major.minor.patch`
 */
export default class SemVer {
    /**
     * Creates a new instance of the SemVer class
     * @param version The version string to parse
     */
    constructor(readonly version: SemVerString) { }

    /**
     * Gets the major version number
     */
    get major(): number {
        return parseInt(this.version.split('.')[0]);
    }

    /**
     * Gets the minor version number
     */
    get minor(): number {
        return parseInt(this.version.split('.')[1]);
    }

    /**
     * Gets the patch version number
     */
    get patch(): number {
        return parseInt(this.version.split('.')[2]);
    }

    /**
     * Compares this instance to another SemVer instance
     * @param other The other SemVer instance to compare to
     * @returns A negative number if this instance is less than the other, a positive number if this instance is greater than the other, or zero if they are equal
     */
    compare(other: SemVer | SemVerString): number {
        if (typeof other === 'string')
            other = new SemVer(other);

        if (this.major !== other.major)
            return this.major - other.major;

        if (this.minor !== other.minor)
            return this.minor - other.minor;

        return this.patch - other.patch;
    }

    /**
     * Checks if this instance is greater than another SemVer instance or version string
     * @param other The other SemVer to compare to
     * @returns True if this instance is greater than the other, false otherwise
     */
    gt(other: SemVer | SemVerString): boolean {
        return this.compare(other) > 0;
    }

    /**
     * Checks if this instance is greater than or equal to another SemVer instance or version string
     * @param other The other SemVer to compare to
     * @returns True if this instance is greater than or equal to the other, false otherwise
     */
    gte(other: SemVer | SemVerString): boolean {
        return this.compare(other) >= 0;
    }

    /**
     * Checks if this instance is less than another SemVer instance or version string
     * @param other The other SemVer to compare to
     * @returns True if this instance is less than the other, false otherwise
     */
    lt(other: SemVer | SemVerString): boolean {
        return this.compare(other) < 0;
    }

    /**
     * Checks if this instance is less than or equal to another SemVer instance or version string
     * @param other The other SemVer to compare to
     * @returns True if this instance is less than or equal to the other, false otherwise
     */
    lte(other: SemVer | SemVerString): boolean {
        return this.compare(other) <= 0;
    }

    /**
     * Checks if this instance is equal to another SemVer instance or version string
     * @param other The other SemVer to compare to
     * @returns True if this instance is equal to the other, false otherwise
     */
    eq(other: SemVer | SemVerString): boolean {
        return this.compare(other) === 0;
    }
}