/**
 * Automated Check Interactors
 *
 * This module provides the framework for automated requirement quality checks.
 * Each review category (READABILITY, CORRECTNESS, CONSISTENCY, etc.) extends
 * the BaseAutomatedCheckInteractor to leverage shared orchestration patterns.
 */

export { BaseAutomatedCheckInteractor, type AutomatedCheckResult, type CheckContext } from './BaseAutomatedCheckInteractor.js'
export { ReadabilityCheckInteractor } from './ReadabilityCheckInteractor.js'
