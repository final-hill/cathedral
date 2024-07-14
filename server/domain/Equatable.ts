export default interface Equatable {
    /**
     * Compares two entities for equality.
     * @param other - The other entity to compare.
     * @returns True if the entities are equal, false otherwise.
     */
    equals(other: this): boolean;
}