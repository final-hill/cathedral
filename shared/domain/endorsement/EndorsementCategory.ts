/**
 * Defines the different categories of endorsements in the system
 */
export enum EndorsementCategory {
    /**
     * Role-based endorsements requiring manual action from designated persons
     * (Product Owner, Implementation Owner, and role-specific endorsers)
     */
    ROLE_BASED = 'role_based',

    /**
     * Automated correctness validation checks
     */
    CORRECTNESS = 'correctness',

    /**
     * Automated justifiability assessment
     */
    JUSTIFIABILITY = 'justifiability',

    /**
     * Automated completeness validation
     */
    COMPLETENESS = 'completeness',

    /**
     * Automated consistency checks
     */
    CONSISTENCY = 'consistency',

    /**
     * Automated non-ambiguity validation
     */
    NON_AMBIGUITY = 'non_ambiguity',

    /**
     * Automated feasibility assessment
     */
    FEASIBILITY = 'feasibility',

    /**
     * Automated abstractness level validation
     */
    ABSTRACTNESS = 'abstractness',

    /**
     * Automated traceability validation
     */
    TRACEABILITY = 'traceability',

    /**
     * Automated delimitedness validation
     */
    DELIMITEDNESS = 'delimitedness',

    /**
     * Automated readability assessment
     */
    READABILITY = 'readability',

    /**
     * Automated modifiability assessment
     */
    MODIFIABILITY = 'modifiability',

    /**
     * Automated verifiability assessment
     */
    VERIFIABILITY = 'verifiability',

    /**
     * Automated prioritization validation
     */
    PRIORITIZATION = 'prioritization'
}
