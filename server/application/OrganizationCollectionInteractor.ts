import type { OrganizationType } from '#shared/domain'
import { AppRole, DuplicateEntityException, NotFoundException } from '#shared/domain'
import { slugify } from '#shared/utils'
import type { OrganizationCollectionRepository } from '../data/repositories'
import type { EntraService } from '../data/services'
import { Interactor } from './Interactor'
import type { PermissionInteractor } from './PermissionInteractor'

export class OrganizationCollectionInteractor extends Interactor<OrganizationType, OrganizationCollectionRepository> {
    private readonly permissionInteractor: PermissionInteractor
    private readonly entraGroupService: EntraService

    /**
     * Create a new OrganizationCollectionInteractor
     *
     * @param props.repository - The repository to use
     * @param props.permissionInteractor - The PermissionInteractor instance
     * @param props.entraGroupService - The EntraGroupService instance for user name resolution
     */
    constructor(props: {
        // TODO: This should be Repository<Organization>
        repository: OrganizationCollectionRepository
        permissionInteractor: PermissionInteractor
        entraService: EntraService
    }) {
        super(props)
        this.permissionInteractor = props.permissionInteractor
        this.entraGroupService = props.entraService
    }

    /**
     * Creates a new organization in the database and sets the creator as an admin
     *
     * @param props.name The name of the organization
     * @param props.description The description of the organization
     * @returns The new organization id
     * @throws {DuplicateEntityException} If the organization already exists
     * @throws {DuplicateEntityException} If the app user organization role already exists
     * @throws {MismatchException} If the computed slug doesn't match the slugified name
     */
    async createOrganization(props: Pick<OrganizationType, 'name' | 'description'>): Promise<OrganizationType['id']> {
        const repo = this.repository,
            currentUserId = this.permissionInteractor.userId,
            newOrgId = await repo.createOrganization({ ...props, createdById: currentUserId, creationDate: new Date() })

        // Add the creator as organization admin and update session immediately
        await this.permissionInteractor.addOrganizationCreatorRole({
            appUserId: currentUserId,
            organizationId: newOrgId,
            role: AppRole.ORGANIZATION_ADMIN
        })

        return newOrgId
    }

    /**
     * Delete the organization
     *
     * @throws {PermissionDeniedException} If the user is not an admin of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     */
    async deleteOrganizationById(id: OrganizationType['id']): Promise<void> {
        const currentUserId = this.permissionInteractor.userId
        this.permissionInteractor.assertOrganizationAdmin(id)

        // Note: For soft deletion, we don't delete Entra groups immediately
        // This preserves user permissions and allows for potential organization restoration
        // Groups should only be deleted during hard deletion or cleanup processes

        return this.repository.deleteOrganization({
            deletedById: currentUserId,
            deletedDate: new Date(),
            id
        })
    }

    /**
     * Delete the organization by slug
     *
     * @throws {PermissionDeniedException} If the user is not an admin of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     */
    async deleteOrganizationBySlug(slug: OrganizationType['slug']): Promise<void> {
        const org = (await this.repository.findOrganizations({ slug }))[0]

        if (!org) throw new NotFoundException('Organization not found')

        this.permissionInteractor.assertOrganizationAdmin(org.id)
        return this.deleteOrganizationById(org.id)
    }

    /**
     * Find organizations that match the query parameters where the current user is a reader of the organization
     *
     * @param query The query parameters to filter organizations by
     * @returns The organizations that match the query parameters with enriched user names
     */
    async findOrganizations(query: Partial<OrganizationType> = {}): Promise<OrganizationType[]> {
        const orgs = await this.repository.findOrganizations(query),
            // Check permissions for each organization and filter out those the user can't read
            permissionChecks = await Promise.all(
                orgs.map(async org => ({
                    org,
                    canRead: this.permissionInteractor.isOrganizationReader(org.id)
                }))
            ),
            authorizedOrgs = permissionChecks
                .filter(({ canRead }) => canRead)
                .map(({ org }) => org)

        return await this.enrichOrganizationsWithUserNames(authorizedOrgs)
    }

    /**
     * Enriches organizations with user names from Entra service
     * @param organizations - Array of organizations from repository
     * @returns Array of organizations with enriched user names in createdBy and modifiedBy fields
     */
    private async enrichOrganizationsWithUserNames(organizations: OrganizationType[]): Promise<OrganizationType[]> {
        return await Promise.all(
            organizations.map(async (org) => {
                let createdByName = 'Unknown User',
                    modifiedByName = 'Unknown User'

                // Get creator name
                try {
                    if (org.createdBy?.id) {
                        const creator = await this.entraGroupService.getUser(org.createdBy.id)
                        createdByName = creator.name || 'Unknown User'
                    }
                } catch (error) {
                    console.warn(`Failed to get creator name for organization ${org.id}, user ${org.createdBy?.id}:`, error)
                }

                // Get modifier name
                try {
                    if (org.modifiedBy?.id) {
                        const modifier = await this.entraGroupService.getUser(org.modifiedBy.id)
                        modifiedByName = modifier.name || 'Unknown User'
                    }
                } catch (error) {
                    console.warn(`Failed to get modifier name for organization ${org.id}, user ${org.modifiedBy?.id}:`, error)
                }

                return {
                    ...org,
                    createdBy: {
                        id: org.createdBy?.id || '',
                        name: createdByName,
                        entityType: 'app_user' as const
                    },
                    modifiedBy: {
                        id: org.modifiedBy?.id || '',
                        name: modifiedByName,
                        entityType: 'app_user' as const
                    }
                }
            })
        )
    }

    /**
     * Update the organization with the given properties.
     *
     * @param params - The parameters for updating the organization
     * @param params.slug The slug of the organization to update
     * @param params.props The properties to update
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     * @throws {DuplicateEntityException} If an organization already exists with the new name
     */
    async updateOrganizationBySlug({ slug, ...props }: { slug: OrganizationType['slug'] } & Pick<Partial<OrganizationType>, 'name' | 'description'>): Promise<void> {
        const currentUserId = this.permissionInteractor.userId,
            existingOrg = (await this.repository.findOrganizations({ slug }))[0]

        if (!existingOrg) throw new NotFoundException(`Organization not found with slug: ${slug}`)

        const newSlug = props.name ? slugify(props.name) : existingOrg.slug

        this.permissionInteractor.assertOrganizationContributor(existingOrg.id)

        const existingSlugOrg = (await this.repository.findOrganizations({ slug: newSlug }))[0]

        if (existingSlugOrg && existingSlugOrg.id !== existingOrg.id) throw new DuplicateEntityException('Organization already exists with that name')

        await this.repository.updateOrganizationById({
            id: existingOrg.id,
            modifiedById: currentUserId,
            modifiedDate: new Date(),
            ...props
        })
    }
}
