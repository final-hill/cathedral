# Testing Implementation Plan

**Branch**: `716-implement-comprehensive-testing`
**Created**: October 25, 2025
**Purpose**: Convert descriptive/prescriptive rules from CONTRIBUTING.md into enforceable tests

---

## 🎯 **Objective**

Move business rules and requirements from documentation (CONTRIBUTING.md) into executable tests to ensure:
- Rules are automatically enforced
- Changes that violate rules are caught immediately
- Documentation stays in sync with implementation
- Regression prevention

---

## 📊 **Progress Tracker**

### ✅ **Completed**
- [x] Basic testing infrastructure setup
- [x] Authentication test helpers (`/server/tests/utils/auth-helpers.ts`)
- [x] API integration test framework (`/e2e/api-integration.test.ts`)
- [x] Header-based authentication for tests
- [x] Type-safe mock users matching `User` type from `#auth-utils`
- [x] Testing plan document created and refined
- [x] Test file structure created for Phase 1.1

### 🚧 **In Progress**
- [x] Phase 1.1: Workflow State Transitions (e2e/workflow-transitions.test.ts) - **BLOCKED**
  - **Status**: Test structure and helpers created, but cannot execute due to infrastructure limitation
  - **Blocker**: Organization creation in test environment fails because it attempts to add users to Azure AD groups via Microsoft Graph API. Test users have fake IDs (`test-sysadmin-id`, etc.) that are rejected by Graph API with "Invalid object identifier" error.
  - **Root Cause**: `OrganizationCollectionInteractor.createOrganization()` → `PermissionInteractor.addOrganizationCreatorRole()` → `EntraService.addUserToOrganizationGroup()` attempts real Azure AD operations even in test environment
  - **Attempted Solutions**:
    - ✅ Created helper function `createTestOrgAndSolution()` to set up test data per test
    - ✅ Used authenticated test users via `actingAs()` helper
    - ❌ Cannot create organizations through API due to Graph API calls
  - **Files Created**:
    - `/e2e/workflow-transitions.test.ts` - Complete test structure with 12 test cases (1 failing, 11 skipped)
    - `/server/tests/workflows/basic-transitions.test.ts` - Placeholder noting tests are in e2e folder
  - **Next Steps**:
    1. Mock EntraService in test environment OR
    2. Seed test database with pre-existing organizations/solutions OR
    3. Disable Azure AD integration for test environment OR
    4. Create a test-specific organization creation endpoint that bypasses Azure AD

### 📋 **Pending**
- See Phase 1-4 below

---

## 📁 **Test File Structure**

```
server/tests/
├── utils/
│   └── auth-helpers.ts ✅ (completed)
├── workflows/
│   ├── basic-transitions.test.ts
│   ├── silence-requirements.test.ts
│   ├── parsed-requirements.test.ts
│   ├── singleton-requirements.test.ts
│   ├── endorsement-workflow.test.ts
│   └── versioning-parallel-development.test.ts
├── solution/
│   ├── solution-initialization.test.ts
│   └── personnel-management.test.ts
├── permissions/
│   ├── role-based-access.test.ts
│   └── endorsement-permissions.test.ts
└── validation/
    ├── reference-validation.test.ts
    └── autocomplete-behavior.test.ts

e2e/
├── api-integration.test.ts ✅ (completed - basic auth tests)
├── workflow-api.test.ts (comprehensive workflow endpoint tests)
└── permissions-api.test.ts (authorization tests)
```

---

## 🔄 **Implementation Phases**

### **Phase 1: Critical Business Logic** (Highest Priority)

#### **1.1 Workflow State Transitions** (`server/tests/workflows/basic-transitions.test.ts`)

**Source**: CONTRIBUTING.md "Workflow States" and "Workflow Transitions" sections

**Tests to implement**:
- ✅ Test valid transitions: Proposed → Review → Active
- ✅ Test valid transitions: Proposed → Removed
- ✅ Test valid transitions: Active → Proposed (Revise)
- ✅ Test valid transitions: Active → Removed
- ✅ Test valid transitions: Rejected → Proposed (Revise)
- ✅ Test valid transitions: Rejected → Removed
- ✅ Test valid transitions: Removed → Proposed (Restore)
- ✅ Test invalid transitions are rejected (e.g., Active → Review, Removed → Active)
- ✅ Test state-specific actions are available/unavailable correctly
- ✅ Test ReqId is generated only for Active requirements

**Implementation notes**:
- Use MikroORM with test database
- Test all requirement types that support workflows
- Verify workflow state is persisted correctly

---

#### **1.2 Endorsement Workflow** (`server/tests/workflows/endorsement-workflow.test.ts`)

**Source**: CONTRIBUTING.md "Endorsement Workflow" section

**Tests to implement**:
- ✅ Test endorsement requests created when requirement enters Review state
- ✅ Test endorsements match person capabilities based on requirement type
- ✅ Test endorsement approval increments approval count
- ✅ Test endorsement rejection immediately moves requirement to Rejected
- ✅ Test automatic transition to Active when all endorsements approved AND dependencies Active
- ✅ Test requirement remains in Review if dependencies not Active
- ✅ Test automatic transition to Rejected when any endorsement rejected
- ✅ Test only users linked to persons with endorsing capabilities can provide endorsements
- ✅ Test solution creator automatically has endorsing capabilities

**Implementation notes**:
- Test with different requirement categories (Project, Environment, Goals, System)
- Verify endorsement permissions are checked correctly
- Test dependency validation before approval

---

#### **1.3 Solution Initialization** (`server/tests/solution/solution-initialization.test.ts`)

**Source**: CONTRIBUTING.md "Solution Initialization and Personnel Management" section

**Tests to implement**:
- ✅ Test Solution Creator Person is automatically created
- ✅ Test Solution Creator Person is in Active workflow state
- ✅ Test Solution Creator has isProductOwner = true
- ✅ Test Solution Creator has isImplementationOwner = true
- ✅ Test Solution Creator has all endorsement permissions
- ✅ Test AppUser-Person linking is established correctly
- ✅ Test Context and Objective requirement is auto-created in Proposed state
- ✅ Test Context and Objective is properly configured as singleton

**Implementation notes**:
- Test complete solution initialization flow
- Verify all automatic entities are created in correct states
- Test that re-creating solution doesn't duplicate entities

---

#### **1.4 Singleton Requirements** (`server/tests/workflows/singleton-requirements.test.ts`)

**Source**: CONTRIBUTING.md "Special Case: Singleton Requirements" section

**Tests to implement**:
- ✅ Test only one singleton requirement ID exists at a time (across all non-Removed states)
- ✅ Test cannot create new singleton if one exists in Proposed state
- ✅ Test cannot create new singleton if one exists in Review state
- ✅ Test cannot create new singleton if one exists in Active state
- ✅ Test cannot create new singleton if one exists in Rejected state
- ✅ Test CAN create new singleton if only instance is in Removed state
- ✅ Test cannot restore Removed singleton if another exists
- ✅ Test cannot remove Active singleton requirement
- ✅ Test CAN remove singleton in other states (Proposed, Review, Rejected)
- ✅ Test error messages guide users to edit/revise existing singleton
- ✅ Test UI hides Remove action for Active singletons

**Implementation notes**:
- Test with Context and Objective (the primary singleton)
- Test across all workflow states
- Verify error messages are user-friendly

---

#### **1.5 Silence Requirements** (`server/tests/workflows/silence-requirements.test.ts`)

**Source**: CONTRIBUTING.md "Special Case: Silence Requirements" section

**Tests to implement**:
- ✅ Test Silence requirements are automatically created in Rejected state
- ✅ Test Silence can transition from Rejected to Removed
- ✅ Test Silence cannot transition to any other state (Proposed, Review, Active)
- ✅ Test Silence cannot be restored from Removed state
- ✅ Test Silence requirements serve as placeholders for unparseable content

**Implementation notes**:
- Test only valid transition (Rejected → Removed)
- Verify all other transitions are blocked
- Test API endpoints respect these restrictions

---

#### **1.6 ParsedRequirements** (`server/tests/workflows/parsed-requirements.test.ts`)

**Source**: CONTRIBUTING.md "Special Case: ParsedRequirements" section

**Tests to implement**:
- ✅ Test ParsedRequirements are automatically created in Parsed state
- ✅ Test ParsedRequirements cannot transition to any other state
- ✅ Test ParsedRequirements serve as containers only (non-actionable)
- ✅ Test ParsedRequirements name field distinguishes source ("Free-form requirements")
- ✅ Test UI doesn't display workflow state for ParsedRequirements
- ✅ Test workflow filtering not available for ParsedRequirements

**Implementation notes**:
- Test that ParsedRequirements stay in Parsed state
- Verify container relationship with parsed requirements
- Test source tracking via name field

---

### **Phase 2: Data Integrity** (Medium Priority)

#### **2.1 Versioning & Parallel Development** (`server/tests/workflows/versioning-parallel-development.test.ts`)

**Source**: CONTRIBUTING.md "Requirement Versioning and Parallel Development" section

**Tests to implement**:
- ✅ Test requirements have multiple versions over time
- ✅ Test versions identified by effectiveFrom timestamp
- ✅ Test only one version can be Active at a time
- ✅ Test multiple versions can exist in Proposed state
- ✅ Test multiple versions can exist in Review state
- ✅ Test multiple independent revisions can be proposed simultaneously
- ✅ Test each proposed version follows independent review cycle
- ✅ Test only one revision can be initiated at a time from same Active version
- ✅ Test Active requirement revision blocked if newer versions exist in Proposed
- ✅ Test Active requirement revision blocked if newer versions exist in Review
- ✅ Test conflict prevention scenario (User A revises, User B blocked)
- ✅ Test User B can revise after User A's revision becomes Active

**Implementation notes**:
- Test with realistic versioning scenarios
- Test timestamp-based version identification
- Verify parallel development constraints work correctly

---

#### **2.2 Reference Validation** (`server/tests/validation/reference-validation.test.ts`)

**Source**: CONTRIBUTING.md "Autocomplete and Reference Validation" section

**Tests to implement**:
- ✅ Test requirements can reference any visible workflow state during editing
- ✅ Test all referenced requirements must be Active before approval
- ✅ Test approval fails with descriptive error for non-Active references
- ✅ Test error message identifies which reference is not Active
- ✅ Test topological ordering validation works correctly
- ✅ Test multiple references validated together
- ✅ Test circular reference detection (if applicable)

**Implementation notes**:
- Test with different reference types (Primary Actor, Outcome, etc.)
- Verify error messages are clear and actionable
- Test complex reference chains

---

#### **2.3 Person Protection Rules** (`server/tests/solution/personnel-management.test.ts`)

**Source**: CONTRIBUTING.md "Person Protection Rules" section

**Tests to implement**:
- ✅ Test persons with Product Owner capability cannot be removed
- ✅ Test persons with Implementation Owner capability cannot be removed
- ✅ Test system ensures at least one Product Owner exists
- ✅ Test system ensures at least one Implementation Owner exists
- ✅ Test validation prevents removing sole holder of mandatory capability
- ✅ Test CAN remove person if another person has same capability
- ✅ Test AppUser deactivation updates corresponding Person entities
- ✅ Test capability continuity during personnel changes

**Implementation notes**:
- Test with multiple persons having different capabilities
- Test edge cases (last person with capability)
- Verify cascade behavior on AppUser deactivation

---

### **Phase 3: Integration & API** (Medium Priority)

#### **3.1 Workflow API Endpoints** (`e2e/workflow-api.test.ts`)

**Source**: CONTRIBUTING.md "API Endpoints" section

**For each requirement type, test**:
- ✅ `PUT /api/requirements/[reqType]/propose` - Create new requirement
- ✅ `POST /api/requirements/[reqType]/proposed/[id]/edit` - Edit proposed
- ✅ `POST /api/requirements/[reqType]/proposed/[id]/review` - Submit for review
- ✅ `POST /api/requirements/[reqType]/proposed/[id]/remove` - Remove proposed
- ✅ `POST /api/requirements/[reqType]/review/[id]/approve` - Approve (via review interface)
- ✅ `POST /api/requirements/[reqType]/review/[id]/reject` - Reject (via review interface)
- ✅ `POST /api/requirements/[reqType]/rejected/[id]/revise` - Revise rejected
- ✅ `POST /api/requirements/[reqType]/rejected/[id]/remove` - Remove rejected
- ✅ `POST /api/requirements/[reqType]/active/[id]/edit` - Revise active (with conflict check)
- ✅ `POST /api/requirements/[reqType]/active/[id]/remove` - Remove active
- ✅ `POST /api/requirements/[reqType]/removed/[id]/restore` - Restore removed

**Special cases**:
- ✅ Test Silence requirement endpoints (only remove from Rejected)
- ✅ Test ParsedRequirements endpoints (no workflow operations)
- ✅ Test Singleton requirement endpoint restrictions

**Implementation notes**:
- Use existing `actingAs()` helper for authentication
- Test with multiple requirement types
- Verify proper status codes and error messages
- Test authorization for each endpoint

---

#### **3.2 Autocomplete Behavior** (`server/tests/validation/autocomplete-behavior.test.ts`)

**Source**: CONTRIBUTING.md "Autocomplete and Reference Validation" section

**Tests to implement**:
- ✅ Test autocomplete shows Active requirements
- ✅ Test autocomplete shows Proposed requirements
- ✅ Test autocomplete shows Review requirements
- ✅ Test autocomplete excludes Rejected requirements
- ✅ Test autocomplete excludes Removed requirements
- ✅ Test autocomplete excludes Parsed requirements
- ✅ Test workflow state is displayed in options (e.g., "HR Manager (Active)")
- ✅ Test options are properly formatted

**Implementation notes**:
- Test `/api/autocomplete` endpoint
- Verify filtering logic
- Test option formatting

---

#### **3.3 Permission & Authorization** (`e2e/permissions-api.test.ts`)

**Source**: CONTRIBUTING.md "Permission Requirements" section

**Tests to implement**:
- ✅ Test Organization Reader can view requirements in all states
- ✅ Test Organization Reader CANNOT perform workflow operations
- ✅ Test Organization Contributor can perform all workflow operations
- ✅ Test Organization Contributor can create requirements
- ✅ Test Organization Contributor can review requirements
- ✅ Test Organization Admin has all contributor permissions
- ✅ Test Organization Admin can manage users
- ✅ Test endorsement permissions based on person capabilities
- ✅ Test Product Owner has all endorsement permissions
- ✅ Test Implementation Owner has all endorsement permissions

**Implementation notes**:
- Use different user types from auth-helpers
- Test access control on all workflow operations
- Verify proper 401/403 responses for unauthorized actions

---

## 🛠️ **Testing Utilities & Helpers**

### **Existing Helpers**

#### `/server/tests/utils/auth-helpers.ts` ✅
```typescript
// Mock users with full User type from auth.d.ts
export const mockUsers = {
    sysAdmin: { ... },
    orgAdmin: { ... },
    user: { ... },
    anonymous: null
}

// Create mock sessions for unit tests
export function createMockSession(userType)

// Mock useUserSession composable
export function mockUserSession(userType)
```

#### `/e2e/helpers/session-helpers.ts` ✅
```typescript
// Mock users for integration tests
export const mockUsers = { ... }

// Playwright-based authentication
export async function authenticateAs({ page, userType })

// UI verification helpers
export async function verifyUserInfo({ page, email, name })
```

#### `/e2e/api-integration.test.ts` - `actingAs()` helper ✅
```typescript
// Header-based authentication for API tests
async function actingAs(userType: TestUserType) {
    // Returns: { get, post, put, remove, notFound, unauthorized, user }
}
```

### **Helpers to Create**

#### Test Database Setup
```typescript
// /server/tests/utils/test-database.ts
export async function setupTestDatabase()
export async function cleanupTestDatabase()
export async function resetTestDatabase()
```

**Status**: ⚠️ **BLOCKED** - Need to resolve Azure AD integration in test environment first

**Infrastructure Issue**: Current architecture tightly couples organization creation with Azure AD group management. Test environment needs one of:
- Mock EntraService that doesn't make real Graph API calls
- Pre-seeded test database with organizations/solutions
- Test-specific endpoints that bypass Azure AD
- Configuration flag to disable Azure AD in test environment

#### Requirement Factory
```typescript
// /server/tests/utils/requirement-factory.ts
export function createTestRequirement(type, state, overrides)
export function createRequirementWithDependencies()
```

**Status**: 📋 Pending (blocked by test database setup)

#### Workflow Helpers
```typescript
// /server/tests/utils/workflow-helpers.ts
export async function transitionRequirement(id, toState)
export async function createEndorsements(requirementId)
export async function approveAllEndorsements(requirementId)
```

**Status**: 📋 Pending (blocked by test database setup)

---

## 📝 **Testing Best Practices**

### **Test Structure**
```typescript
describe('Feature Category', () => {
    beforeEach(async () => {
        // Setup: Clean database, create test data
    })

    afterEach(async () => {
        // Cleanup: Reset state
    })

    test('should [expected behavior]', async () => {
        // Arrange: Set up test data
        // Act: Execute the operation
        // Assert: Verify the result
    })
})
```

### **Naming Conventions**
- File names: `kebab-case.test.ts`
- Test descriptions: Start with "should" or use Given/When/Then
- Be specific and descriptive

### **What to Test**
- ✅ Business rules and constraints
- ✅ State transitions and workflows
- ✅ Authorization and permissions
- ✅ Data integrity and validation
- ✅ Error handling and edge cases

### **What NOT to Test**
- ❌ Framework internals (MikroORM, Nuxt)
- ❌ Third-party libraries
- ❌ Simple getters/setters
- ❌ UI rendering (use component tests for that)

---

## 🚀 **Execution Strategy**

### **Step-by-Step Process**

1. **Pick a test file from Phase 1**
2. **Read the corresponding CONTRIBUTING.md section**
3. **Create the test file with basic structure**
4. **Implement tests one by one**
5. **Run tests and verify they pass**
6. **Update this document's progress tracker**
7. **Commit with descriptive message**
8. **Move to next test file**

### **When Tests Fail**
- First verify the test is correct (not the implementation)
- If implementation is wrong, fix it
- If test is wrong, adjust the test
- If requirement is ambiguous, clarify in CONTRIBUTING.md

### **Communication Pattern**
At each step, provide:
1. What you're about to implement
2. Show the test code
3. Run the tests
4. Report results
5. Update progress tracker

---

## ✅ **Definition of Done**

A test category is considered complete when:
- [ ] All tests listed in the plan are implemented
- [ ] All tests pass consistently
- [ ] Tests follow best practices and conventions
- [ ] Code is properly documented
- [ ] Progress tracker is updated
- [ ] Changes are committed
- [ ] CONTRIBUTING.md is updated (if clarifications needed)

---

## 📚 **Reference Documentation**

### **Key Files**
- `/workspace/cathedral/CONTRIBUTING.md` - Source of truth for requirements
- `/workspace/cathedral/shared/types/auth.d.ts` - User type definitions
- `/workspace/cathedral/server/middleware/test-auth.ts` - Test authentication middleware
- `/workspace/cathedral/vitest.config.ts` - Test configuration

### **Existing Tests**
- `/workspace/cathedral/shared/utils/*.test.ts` - Unit test examples
- `/workspace/cathedral/e2e/api-integration.test.ts` - API integration test example

### **Related Issues**
- Branch: `716-implement-comprehensive-testing`
- Related to database Version Normal Form: Issue #435

---

## 📊 **Metrics to Track**

- Total tests implemented: 0
- Total tests passing: 81 (from current test suite)
- Code coverage: TBD
- Test execution time: ~26s (current)

---

## 🔄 **Next Actions**

1. **🚨 CRITICAL: Resolve Test Infrastructure Blocker**
   - **Issue**: Cannot create organizations in test environment due to Azure AD Graph API integration
   - **Options to resolve**:
     a. Create mock EntraService for test environment
     b. Add database seeding script for test organizations/solutions
     c. Create test-specific endpoints that bypass Azure AD
     d. Add environment configuration to disable Azure AD in tests
   - **Recommendation**: Option (b) - Database seeding is cleanest and most maintainable

2. **Complete Phase 1.1: Workflow State Transitions** (once blocker resolved)
   - Implement remaining 11 test cases in workflow-transitions.test.ts
   - Verify all state transitions work correctly
   - Test ReqId generation on Active state

3. **Continue through remaining phases incrementally**
   - Phase 1.2: Endorsement Workflow
   - Phase 1.3: Solution Initialization
   - etc.

---

**Last Updated**: October 25, 2025 17:48 UTC
**Status**: Phase 1.1 blocked on test infrastructure - awaiting resolution decision
