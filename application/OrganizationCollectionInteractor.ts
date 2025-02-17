import type { Organization } from "~/domain/requirements";
import { Interactor } from "./Interactor";
import { type OrganizationCollectionRepository } from "~/server/data/repositories";
import { AppRole, type AppUser } from "~/domain/application";
import { DuplicateEntityException, NotFoundException, PermissionDeniedException } from "~/domain/exceptions";
import { slugify } from "~/shared/utils";

export class OrganizationCollectionInteractor extends Interactor<Organization> {
    /**
     * Create a new OrganizationCollectionInteractor
     *
     * @param props.repository - The repository to use
     * @param props.userId - The id of the user to utilize
     */
    constructor(props: {
        // TODO: This should be Repository<Organization>
        repository: OrganizationCollectionRepository,
        userId: AppUser['id']
    }) { super(props) }

    // FIXME: this shouldn't be necessary
    get repository(): OrganizationCollectionRepository {
        return this._repository as OrganizationCollectionRepository
    }

    /**
     * Creates a new organization in the database and sets the creator as an admin
     *
     * @param props.name The name of the organization
     * @param props.description The description of the organization
     * @returns The new organization id
     * @throws {DuplicateEntityException} If the organization already exists
     * @throws {DuplicateEntityException} If the app user organization role already exists
     */
    async createOrganization(props: Pick<Organization, 'name' | 'description'>): Promise<Organization['id']> {
        const repo = this.repository,
            effectiveDate = new Date(),
            newOrgId = await repo.createOrganization({ ...props, createdById: this._userId, effectiveDate })

        await repo.addAppUserOrganizationRole({
            effectiveDate,
            appUserId: this._userId,
            organizationId: newOrgId,
            role: AppRole.ORGANIZATION_ADMIN,
            createdById: this._userId
        })

        return newOrgId
    }

    /**
     * Delete the organization
     *
     * @throws {PermissionDeniedException} If the user is not an admin of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     */
    async deleteOrganizationById(id: Organization['id']): Promise<void> {
        if (!await this.isOrganizationAdmin(id))
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.repository.deleteOrganization({
            deletedById: this._userId,
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
    async deleteOrganizationBySlug(slug: Organization['slug']): Promise<void> {
        const org = (await this.repository.findOrganizations({ slug }))[0]

        if (!org)
            throw new NotFoundException('Organization not found')

        if (!await this.isOrganizationAdmin(org.id))
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.deleteOrganizationById(org.id)
    }

    /**
     * Find organizations that match the query parameters where the current user is a reader of the organization
     *
     * @param query The query parameters to filter organizations by
     * @returns The organizations that match the query parameters
     */
    async findOrganizations(query: Partial<Organization> = {}): Promise<Organization[]> {
        const orgs = await this.repository.findOrganizations(query)

        return orgs.filter(async org => await this.isOrganizationReader(org.id))
    }

    /**
     * Check if the current user is an admin of the organization or a system admin
     * @param id The id of the organization
     * @returns Whether the user is an admin of the organization
     */
    async isOrganizationAdmin(id: Organization['id']): Promise<boolean> {
        const appUser = await this.repository.getOrganizationAppUserById({
            organizationId: id,
            userId: this._userId
        })

        if (appUser.isSystemAdmin) return true

        const auor = await this.repository.getAppUserOrganizationRole({
            organizationId: id,
            userId: appUser.id
        }),
            isOrgAdmin = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN].includes(auor.role)
                : false

        return isOrgAdmin
    }

    /**
     * Check if the current user is a contributor of the organization or a system admin
     * @param id The id of the organization
     * @returns Whether the user is a contributor of the organization
     */
    async isOrganizationContributor(id: Organization['id']): Promise<boolean> {
        const appUser = await this.repository.getOrganizationAppUserById({
            organizationId: id,
            userId: this._userId
        })

        if (appUser.isSystemAdmin) return true

        const auor = await this.repository.getAppUserOrganizationRole({
            organizationId: id,
            userId: appUser.id
        }),
            isOrgContributor = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(auor.role)
                : false

        return isOrgContributor
    }

    /**
     * Check if the current user is a reader of the organization or a system admin
     * @param id The id of the organization
     * @returns Whether the user is a reader of the organization
     */
    async isOrganizationReader(id: Organization['id']): Promise<boolean> {
        const appUser = await this.repository.getOrganizationAppUserById({
            organizationId: id,
            userId: this._userId
        })

        if (appUser.isSystemAdmin) return true

        const auor = await this.repository.getAppUserOrganizationRole({
            organizationId: id,
            userId: appUser.id
        }),
            isOrgReader = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR, AppRole.ORGANIZATION_READER].includes(auor.role)
                : false

        return isOrgReader
    }

    /**
     * Update the organization with the given properties.
     *
     * @param slug The slug of the organization to update
     * @param props The properties to update
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     * @throws {DuplicateEntityException} If an organization already exists with the new name
     */
    async updateOrganizationBySlug(slug: Organization['slug'], props: Pick<Partial<Organization>, 'name' | 'description'>): Promise<void> {
        const existingOrg = (await this.repository.findOrganizations({ slug }))[0],
            newSlug = props.name ? slugify(props.name) : existingOrg.slug

        if (!existingOrg)
            throw new NotFoundException(`Organization not found with slug: ${slug}`)

        if (!await this.isOrganizationContributor(existingOrg.id))
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        const existingSlugOrg = (await this.repository.findOrganizations({ slug: newSlug }))[0]

        if (existingSlugOrg && existingSlugOrg.id !== existingOrg.id)
            throw new DuplicateEntityException('Organization already exists with that name')

        await this.repository.updateOrganizationById(existingOrg.id, {
            modifiedById: this._userId,
            modifiedDate: new Date(),
            ...props
        })
    }
}