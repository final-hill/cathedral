/**
 * Categories of data types that can be used in interface operations.
 */
export enum InterfaceDataTypeKind {
    /**
     * Basic types like string, number, boolean
     */
    PRIMITIVE = 'Primitive',

    /**
     * Composite types like objects, records, structs
     */
    PRODUCT = 'Product',

    /**
     * Union types, enums, discriminated unions
     */
    SUM = 'Sum',

    /**
     * Arrays, lists, sets, maps
     */
    COLLECTION = 'Collection'
}
