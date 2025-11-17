import { ReadabilityCheckType } from '../../../shared/domain/endorsement/ReadabilityCheck.js'
import { ReqType, EndorsementCategory, EndorsementStatus, WorkflowState } from '../../../shared/domain/index.js'
import type { RequirementType, GlossaryTermType } from '../../../shared/domain/requirements/index.js'
import type { ReadabilityCheckResultDtoType } from '../../../shared/dto/ReadabilityCheckResultDto.js'
import type { LanguageToolService } from '../../data/services/LanguageToolService.js'
import type { ReadabilityAnalysisService } from '../../data/services/ReadabilityAnalysisService.js'
import type { RequirementTypeCorrespondenceService } from '../../data/services/RequirementTypeCorrespondenceService.js'
import type { GlossaryTermIdentificationService } from '../../data/services/GlossaryTermIdentificationService.js'
import type { EndorsementRepository } from '../../data/repositories/EndorsementRepository.js'
import type { RequirementRepository } from '../../data/repositories/RequirementRepository.js'
import { BaseAutomatedCheckInteractor, type CheckContext, type AutomatedCheckResult } from './BaseAutomatedCheckInteractor.js'

/**
 * Readability Check Interactor
 *
 * Orchestrates all readability checks for requirements in Review workflow state.
 * Implements the BaseAutomatedCheckInteractor pattern for the READABILITY category.
 *
 * This serves as a reference implementation for other automated check categories.
 * To implement a new category (e.g., CORRECTNESS), follow this pattern:
 * 1. Extend BaseAutomatedCheckInteractor
 * 2. Inject category-specific services in constructor
 * 3. Implement getCategory() to return the appropriate EndorsementCategory
 * 4. Implement performChecks() to run category-specific validations
 * 5. Use Promise.allSettled() for parallel execution of independent checks
 * 6. Use createFailedCheckResult() for error handling
 *
 * Five automated checks:
 * 1. Spelling & Grammar - LanguageTool API (TYPOS, GRAMMAR categories)
 * 2. Readability Score - Flesch-Kincaid Grade Level with type-specific thresholds
 * 3. Formal Language - LanguageTool API (STYLE category)
 * 4. Type Correspondence - Azure OpenAI validates content matches requirement type
 * 5. Glossary Compliance - Azure OpenAI identifies terms + PostgreSQL FTS validates against glossary
 */
export class ReadabilityCheckInteractor extends BaseAutomatedCheckInteractor {
    private readonly languageToolService: LanguageToolService
    private readonly readabilityService: ReadabilityAnalysisService
    private readonly typeCorrespondenceService: RequirementTypeCorrespondenceService
    private readonly glossaryTermService?: GlossaryTermIdentificationService

    constructor(props: {
        languageToolService: LanguageToolService
        readabilityService: ReadabilityAnalysisService
        typeCorrespondenceService: RequirementTypeCorrespondenceService
        glossaryTermService?: GlossaryTermIdentificationService
        endorsementRepository: EndorsementRepository
        requirementRepository: RequirementRepository
    }) {
        super({
            endorsementRepository: props.endorsementRepository,
            requirementRepository: props.requirementRepository
        })
        this.languageToolService = props.languageToolService
        this.readabilityService = props.readabilityService
        this.typeCorrespondenceService = props.typeCorrespondenceService
        this.glossaryTermService = props.glossaryTermService
    }

    /**
     * Get the endorsement category for readability checks
     */
    protected getCategory(): EndorsementCategory {
        return EndorsementCategory.READABILITY
    }

    /**
     * Perform all readability checks on a requirement
     * Implements the abstract performChecks method
     * @param context Requirement and context for checks
     * @returns Array of readability check results with typed check types
     */
    async performChecks(context: CheckContext): Promise<AutomatedCheckResult<Record<string, unknown>, ReadabilityCheckType>[]> {
        const { requirement, solutionId } = context,
            text = this.extractAnalyzableText(requirement),
            results: AutomatedCheckResult<Record<string, unknown>, ReadabilityCheckType>[] = [],
            // Run checks in parallel where possible
            [
                spellingResult,
                readabilityResult,
                formalLanguageResult,
                typeCorrespondenceResult,
                glossaryResult
            ] = await Promise.allSettled([
                this.checkSpellingAndGrammar(text),
                this.checkReadabilityScore({ text, requirementType: requirement.reqType }),
                this.checkFormalLanguage(text),
                this.checkTypeCorrespondence(requirement),
                this.checkGlossaryCompliance({ text, solutionId })
            ])

        // Process results
        if (spellingResult.status === 'fulfilled')
            results.push(spellingResult.value)
        else {
            results.push(this.createFailedCheckResult({
                checkType: ReadabilityCheckType.SPELLING_GRAMMAR,
                title: 'Spelling & Grammar Check Failed',
                error: spellingResult.reason?.message || 'Service unavailable'
            }))
        }

        if (readabilityResult.status === 'fulfilled')
            results.push(readabilityResult.value)
        else {
            results.push(this.createFailedCheckResult({
                checkType: ReadabilityCheckType.READABILITY_SCORE,
                title: 'Readability Score Check Failed',
                error: readabilityResult.reason?.message || 'Service unavailable'
            }))
        }

        if (formalLanguageResult.status === 'fulfilled')
            results.push(formalLanguageResult.value)
        else {
            results.push(this.createFailedCheckResult({
                checkType: ReadabilityCheckType.FORMAL_LANGUAGE,
                title: 'Formal Language Check Failed',
                error: formalLanguageResult.reason?.message || 'Service unavailable'
            }))
        }

        if (typeCorrespondenceResult.status === 'fulfilled')
            results.push(typeCorrespondenceResult.value)
        else {
            results.push(this.createFailedCheckResult({
                checkType: ReadabilityCheckType.TYPE_CORRESPONDENCE,
                title: 'Type Correspondence Check Failed',
                error: typeCorrespondenceResult.reason?.message || 'Service unavailable'
            }))
        }

        if (glossaryResult.status === 'fulfilled')
            results.push(glossaryResult.value)
        else {
            results.push(this.createFailedCheckResult({
                checkType: ReadabilityCheckType.GLOSSARY_COMPLIANCE,
                title: 'Glossary Compliance Check Failed',
                error: glossaryResult.reason?.message || 'Service unavailable'
            }))
        }

        return results
    }

    /**
     * Check 1: Spelling & Grammar using LanguageTool
     */
    private async checkSpellingAndGrammar(text: string): Promise<ReadabilityCheckResultDtoType> {
        const matches = await this.languageToolService.checkSpellingAndGrammar({ text, language: 'en-US' }),
            hasIssues = matches.length > 0

        return {
            checkType: ReadabilityCheckType.SPELLING_GRAMMAR,
            status: hasIssues ? EndorsementStatus.REJECTED : EndorsementStatus.APPROVED,
            title: 'Spelling & Grammar',
            description: hasIssues
                ? `Found ${matches.length} spelling or grammar issue${matches.length > 1 ? 's' : ''}`
                : 'No spelling or grammar issues found',
            details: {
                checkType: ReadabilityCheckType.SPELLING_GRAMMAR,
                languageToolMatches: matches
            }
        }
    }

    /**
     * Check 2: Readability Score using Flesch-Kincaid Grade Level
     *
     * Formula: GL = 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
     *
     * Thresholds:
     * - Goal requirements: ≤ Grade 8 (general audience readability)
     * - Other requirements: ≤ Grade 12 (technical stakeholder readability)
     */
    private async checkReadabilityScore(props: {
        text: string
        requirementType: string
    }): Promise<ReadabilityCheckResultDtoType> {
        const { text, requirementType } = props,
            analysis = await this.readabilityService.analyzeReadability(text),
            threshold = requirementType === ReqType.GOAL ? 8 : 12,
            meetsThreshold = analysis.gradeLevel <= threshold,
            acronyms = await this.readabilityService.detectAcronyms(text)

        return {
            checkType: ReadabilityCheckType.READABILITY_SCORE,
            status: meetsThreshold ? EndorsementStatus.APPROVED : EndorsementStatus.REJECTED,
            title: 'Readability Score',
            description: meetsThreshold
                ? `Grade level ${analysis.gradeLevel.toFixed(1)} (threshold: ${threshold})`
                : `Grade level ${analysis.gradeLevel.toFixed(1)} exceeds threshold of ${threshold}`,
            details: {
                checkType: ReadabilityCheckType.READABILITY_SCORE,
                gradeLevel: analysis.gradeLevel,
                fleschKincaidScore: analysis.fleschReadingEase,
                threshold,
                passed: meetsThreshold,
                undefinedTerms: acronyms // Detected acronyms for glossary check
            }
        }
    }

    /**
     * Check 4: Formal Language using LanguageTool
     */
    private async checkFormalLanguage(text: string): Promise<ReadabilityCheckResultDtoType> {
        const matches = await this.languageToolService.checkFormalLanguage({ text, language: 'en-US' }),
            // Convert to simple informal phrases for UI display
            informalPhrases = matches.map(m => ({
                text: m.message, // Use the message as the informal text
                suggestion: m.replacements[0] // First replacement as suggestion
            })),
            hasInformalLanguage = informalPhrases.length > 0

        return {
            checkType: ReadabilityCheckType.FORMAL_LANGUAGE,
            status: hasInformalLanguage ? EndorsementStatus.REJECTED : EndorsementStatus.APPROVED,
            title: 'Formal Language',
            description: hasInformalLanguage
                ? `Found ${informalPhrases.length} informal language issue${informalPhrases.length > 1 ? 's' : ''}`
                : 'No informal language detected',
            details: {
                checkType: ReadabilityCheckType.FORMAL_LANGUAGE,
                informalPhrases
            }
        }
    }

    /**
     * Check 3: Glossary Compliance using Azure OpenAI and PostgreSQL Full-Text Search
     *
     * Uses AI to identify all terms (acronyms, domain-specific terminology, technical jargon)
     * that warrant glossary definitions, then validates against existing Active GlossaryTerm entries.
     *
     * Process:
     * 1. Use Azure OpenAI to identify terms of art, acronyms, and technical terms
     * 2. Query searchableName tsvector field with GIN index (O(log n) lookup)
     * 3. Match against Active GlossaryTerm requirements
     * 4. Report undefined terms and suggest glossary entries
     */
    private async checkGlossaryCompliance(props: {
        text: string
        solutionId: string
    }): Promise<ReadabilityCheckResultDtoType> {
        const { text, solutionId } = props,
            undefinedTerms: string[] = []

        // Use AI to identify all terms that should be in glossary (including acronyms)
        if (this.glossaryTermService) {
            try {
                const termsOfArt = await this.glossaryTermService.identifyTerms(text)

                // Check each identified term against glossary
                for (const term of termsOfArt) {
                    const matches = await this.requirementRepository.getAllLatest({
                        solutionId,
                        reqType: ReqType.GLOSSARY_TERM,
                        workflowState: WorkflowState.Active,
                        // @ts-expect-error - searchableName exists on GlossaryTermVersionsModel but not in type
                        searchableName: { $fulltext: term }
                    }) as GlossaryTermType[]

                    if (matches.length === 0)
                        undefinedTerms.push(term)
                }
            } catch (error) {
                console.error('Error identifying terms of art:', error)
                // If AI fails, return approved status rather than blocking workflow
                return {
                    checkType: ReadabilityCheckType.GLOSSARY_COMPLIANCE,
                    status: EndorsementStatus.APPROVED,
                    title: 'Glossary Compliance',
                    description: 'AI check temporarily unavailable - approved by default',
                    details: {
                        checkType: ReadabilityCheckType.GLOSSARY_COMPLIANCE,
                        undefinedTerms: [],
                        suggestedGlossaryTerms: []
                    }
                }
            }
        }

        const hasIssues = undefinedTerms.length > 0

        return {
            checkType: ReadabilityCheckType.GLOSSARY_COMPLIANCE,
            status: hasIssues ? EndorsementStatus.REJECTED : EndorsementStatus.APPROVED,
            title: 'Glossary Compliance',
            description: hasIssues
                ? `Found ${undefinedTerms.length} undefined term${undefinedTerms.length > 1 ? 's' : ''} that should be in the glossary`
                : 'All identified terms are defined in the glossary',
            details: {
                checkType: ReadabilityCheckType.GLOSSARY_COMPLIANCE,
                undefinedTerms,
                suggestedGlossaryTerms: undefinedTerms
            }
        }
    }

    /**
     * Check 5: Type Correspondence using Azure OpenAI
     */
    private async checkTypeCorrespondence(
        requirement: RequirementType
    ): Promise<ReadabilityCheckResultDtoType> {
        const result = await this.typeCorrespondenceService.validateTypeCorrespondence(requirement),
            isValid = result.isValid

        return {
            checkType: ReadabilityCheckType.TYPE_CORRESPONDENCE,
            status: isValid ? EndorsementStatus.APPROVED : EndorsementStatus.REJECTED,
            title: 'Type Correspondence',
            description: isValid
                ? `Content matches ${requirement.reqType} type`
                : `Content may not match ${requirement.reqType} type`,
            details: {
                checkType: ReadabilityCheckType.TYPE_CORRESPONDENCE,
                typeCorrespondenceIssues: result.issues,
                suggestedGlossaryTerms: result.suggestions // Using this field for improvement suggestions
            }
        }
    }
}
