/**
 * Categories for review items in requirement review process
 */
export enum ReviewCategory {
    // Manual review categories
    ENDORSEMENT = 'Endorsement',

    // Automated quality categories (future implementation)
    CORRECTNESS = 'Correctness',
    JUSTIFIABILITY = 'Justifiability',
    COMPLETENESS = 'Completeness',
    CONSISTENCY = 'Consistency',
    NON_AMBIGUITY = 'NonAmbiguity',
    FEASIBILITY = 'Feasibility',
    TRACEABILITY = 'Traceability',
    VERIFIABILITY = 'Verifiability',
    ABSTRACTNESS = 'Abstractness',
    DELIMITEDNESS = 'Delimitedness',
    READABILITY = 'Readability',
    MODIFIABILITY = 'Modifiability',
    PRIORITIZATION = 'Prioritization'
}
