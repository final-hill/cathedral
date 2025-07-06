import { describe, it, expect } from 'vitest'
import { resolveReqTypeFromModel } from './resolveReqTypeFromModel'
import { ReqType } from '#shared/domain/requirements/ReqType'

describe('resolveReqTypeFromModel', () => {
    it('should return req_type when property is available', () => {
        const mockModel = {
            req_type: ReqType.USER_STORY,
            constructor: { name: 'UserStoryModel' }
        }

        expect(resolveReqTypeFromModel(mockModel)).toBe(ReqType.USER_STORY)
    })

    it('should derive req_type from constructor name when property is undefined', () => {
        const mockModel = {
            req_type: undefined,
            constructor: { name: 'ParsedRequirementsModel' }
        }

        expect(resolveReqTypeFromModel(mockModel)).toBe(ReqType.PARSED_REQUIREMENTS)
    })

    it('should handle various model types correctly', () => {
        const testCases = [
            { constructor: { name: 'OrganizationModel' }, expected: ReqType.ORGANIZATION },
            { constructor: { name: 'SolutionModel' }, expected: ReqType.SOLUTION },
            { constructor: { name: 'FunctionalBehaviorModel' }, expected: ReqType.FUNCTIONAL_BEHAVIOR },
            { constructor: { name: 'UserStoryModel' }, expected: ReqType.USER_STORY }
        ]

        testCases.forEach(({ constructor, expected }) => {
            const mockModel = { req_type: undefined, constructor }
            expect(resolveReqTypeFromModel(mockModel)).toBe(expected)
        })
    })

    it('should throw error for constructor names without Model suffix', () => {
        const mockModel = {
            req_type: undefined,
            constructor: { name: 'InvalidConstructor' }
        }

        expect(() => resolveReqTypeFromModel(mockModel)).toThrow('Unable to resolve req_type for InvalidConstructor')
    })

    it('should throw error for empty constructor name', () => {
        const mockModel = {
            req_type: undefined,
            constructor: { name: '' }
        }

        expect(() => resolveReqTypeFromModel(mockModel)).toThrow('Unable to resolve req_type for ')
    })
})
