import { z } from 'zod'
import { AppRole, Organization, DuplicateEntityException, NotFoundException, PermissionDeniedException } from "#shared/domain";
import { slugify } from "#shared/utils";
import { Interactor } from "./Interactor";
import { PermissionInteractor } from "./PermissionInteractor";
import { type OrganizationCollectionRepository } from "~/server/data/repositories";

export class OrganizationCollectionInteractor extends Interactor<z.infer<typeof Organization>> {
    private readonly _permissionInteractor: PermissionInteractor;

    /**
     * Create a new OrganizationCollectionInteractor
     *
     * @param props.repository - The repository to use
     * @param props.permissionInteractor - The PermissionInteractor instance
     */
    constructor(props: {
        // TODO: This should be Repository<Organization>
        repository: OrganizationCollectionRepository,
        permissionInteractor: PermissionInteractor
    }) {
        super(props);
        this._permissionInteractor = props.permissionInteractor;
    }

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
    async createOrganization(props: Pick<z.infer<typeof Organization>, 'name' | 'description'>): Promise<z.infer<typeof Organization>['id']> {
        const repo = this.repository,
            currentUserId = this._permissionInteractor.userId,
            newOrgId = await repo.createOrganization({ ...props, createdById: currentUserId, creationDate: new Date() })

        await this.repository.addInitialAppuserOrganizationRole({
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
    async deleteOrganizationById(id: z.infer<typeof Organization>['id']): Promise<void> {
        const currentUserId = this._permissionInteractor.userId
        await this._permissionInteractor.assertOrganizationAdmin(id);
        return this.repository.deleteOrganization({
            deletedById: currentUserId,
            deletedDate: new Date(),
            id
        });
    }

    /**
     * Delete the organization by slug
     *
     * @throws {PermissionDeniedException} If the user is not an admin of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     */
    async deleteOrganizationBySlug(slug: z.infer<typeof Organization>['slug']): Promise<void> {
        const org = (await this.repository.findOrganizations({ slug }))[0];

        if (!org)
            throw new NotFoundException('Organization not found');

        await this._permissionInteractor.assertOrganizationAdmin(org.id);
        return this.deleteOrganizationById(org.id);
    }

    /**
     * Find organizations that match the query parameters where the current user is a reader of the organization
     *
     * @param query The query parameters to filter organizations by
     * @returns The organizations that match the query parameters
     */
    async findOrganizations(query: Partial<z.infer<typeof Organization>> = {}): Promise<z.infer<typeof Organization>[]> {
        const orgs = await this.repository.findOrganizations(query);

        // Check permissions for each organization and filter out those the user can't read
        const permissionChecks = await Promise.all(
            orgs.map(async org => ({
                org,
                canRead: await this._permissionInteractor.isOrganizationReader(org.id)
            }))
        );

        return permissionChecks
            .filter(({ canRead }) => canRead)
            .map(({ org }) => org);
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
    async updateOrganizationBySlug(slug: z.infer<typeof Organization>['slug'], props: Pick<Partial<z.infer<typeof Organization>>, 'name' | 'description'>): Promise<void> {
        const currentUserId = this._permissionInteractor.userId,
            existingOrg = (await this.repository.findOrganizations({ slug }))[0],
            newSlug = props.name ? slugify(props.name) : existingOrg.slug;

        if (!existingOrg)
            throw new NotFoundException(`Organization not found with slug: ${slug}`);

        if (!await this._permissionInteractor.isOrganizationContributor(existingOrg.id))
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action');

        const existingSlugOrg = (await this.repository.findOrganizations({ slug: newSlug }))[0];

        if (existingSlugOrg && existingSlugOrg.id !== existingOrg.id)
            throw new DuplicateEntityException('Organization already exists with that name');

        await this.repository.updateOrganizationById(existingOrg.id, {
            modifiedById: currentUserId,
            modifiedDate: new Date(),
            ...props
        });
    }
}