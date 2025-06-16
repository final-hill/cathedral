import type { z } from "zod";
import * as req from "#shared/domain/requirements";
import { ReqType } from "#shared/domain/requirements/enums";
import { AppRole, AppUser } from "#shared/domain/application";
import { MismatchException, PermissionDeniedException } from "#shared/domain/exceptions";
import { type OrganizationRepository } from "~/server/data/repositories";
import { Interactor, type AppUserInteractor, PermissionInteractor } from "./";

/**
 * The OrganizationInteractor class contains the business logic for interacting with an organization.
 */
export class OrganizationInteractor extends Interactor<z.infer<typeof req.Organization>> {
    private readonly _permissionInteractor: PermissionInteractor;
    private readonly _appUserInteractor: AppUserInteractor;

    /**
     * Create a new OrganizationInteractor
     *
     * @param props.repository - The repository to use
     * @param props.permissionInteractor - The PermissionInteractor instance
     */
    constructor(props: {
        // TODO: This should be Repository<Organization>
        repository: OrganizationRepository,
        permissionInteractor: PermissionInteractor,
        appUserInteractor: AppUserInteractor
    }) {
        super(props);
        this._permissionInteractor = props.permissionInteractor;
        this._appUserInteractor = props.appUserInteractor;
    }

    // FIXME: this shouldn't be necessary
    get repository(): OrganizationRepository {
        return this._repository as OrganizationRepository
    }

    /**
     * Add a solution to an organization
     *
     * @param props The properties of the solution
     * @returns The new solution
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {NotFoundException} If the organization does not exist
     */
    async addSolution({ name, description }: Pick<z.infer<typeof req.Solution>, 'name' | 'description'>): Promise<z.infer<typeof req.Solution>['id']> {
        const organization = await this.repository.getOrganization(),
            currentUserId = this._permissionInteractor.userId;

        await this._permissionInteractor.assertOrganizationAdmin(organization.id);

        const repo = this.repository,
            effectiveDate = new Date();

        await this._assertSolutionSlugIsUnique(name);

        const newSolutionId = await repo.addSolution({ name, description, creationDate: effectiveDate, createdById: currentUserId });

        return newSolutionId;
    }

    /**
     * Delete an app user from the current organization
     *
     * @param id The id of the app user to delete
     * @throws {PermissionDeniedException} If the user is not an admin of the organization unless the user is deleting themselves
     * @throws {PermissionDeniedException} If the user is deleting the last admin of the organization
     * @throws {NotFoundException} If the target app user does not exist
     */
    async deleteAppUser(id: z.infer<typeof AppUser>['id']): Promise<void> {
        const organization = await this.repository.getOrganization(),
            pi = this._permissionInteractor,
            currentUserId = pi.userId;

        if (!(await pi.isOrganizationAdmin(organization.id)) && id !== currentUserId)
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action');

        const targetUserAuor = await pi.getAppUserOrganizationRole({
            appUserId: id,
            organizationId: organization.id
        }),
            orgAdminCount = await pi.findAppUserOrganizationRoles({
                organizationId: organization.id,
                role: AppRole.ORGANIZATION_ADMIN
            }).then((roles) => roles.length)

        if (targetUserAuor.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1)
            throw new PermissionDeniedException('Forbidden: You cannot delete the last organization admin.');

        return pi.deleteAppUserOrganizationRole({
            appUserId: id,
            organizationId: organization.id
        });
    }

    /**
     * Delete a solution by slug from an organization
     *
     * @param slug The id of the solution to delete
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async deleteSolutionBySlug(slug: z.infer<typeof req.Solution>['slug']): Promise<void> {
        const organization = await this.repository.getOrganization(),
            currentUserId = this._permissionInteractor.userId;

        await this._permissionInteractor.assertOrganizationAdmin(organization.id);

        return this.repository.deleteSolutionBySlug({
            deletedById: currentUserId,
            deletedDate: new Date(),
            slug
        });
    }


    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     */
    async findSolutions(query: Partial<z.infer<typeof req.Solution>> = {}): Promise<z.infer<typeof req.Solution>[]> {
        const organization = await this.repository.getOrganization()

        await this._permissionInteractor.assertOrganizationReader(organization.id);
        return this.repository.findSolutions(query);
    }

    /**
     * Returns the organization that the user is associated with
     *
     * @returns The organization
     * @throws {NotFoundException} If the organization does not exist
     */
    async getOrganization(): Promise<z.infer<typeof req.Organization>> {
        const org = await this.repository.getOrganization()
        await this._permissionInteractor.assertOrganizationReader(org.id);
        return org;
    }

    /**
     * Get an app user by id
     *
     * @param id The id of the app user to get
     * @returns The app user
     * @throws {NotFoundException} If the app user does not exist
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {PermissionDeniedException} If the user is trying to get an app user that is not in the same organization
     */
    async getAppUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        const org = await this.repository.getOrganization(),
            pi = this._permissionInteractor,
            aui = this._appUserInteractor;

        await pi.assertOrganizationReader(org.id);
        const auor = await pi.getAppUserOrganizationRole({
            appUserId: id,
            organizationId: org.id
        });

        return AppUser.parse({
            ...await aui.getUserById(auor.appUser.id),
            role: auor.role,
            organizations: [{
                reqType: ReqType.ORGANIZATION,
                id: org.id,
                name: org.name
            }]
        });
    }

    /**
     * Get all app users for the organization with their associated roles
     *
     * @returns The app users with their associated roles
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async getAppUsers(): Promise<z.infer<typeof AppUser>[]> {
        const org = await this.repository.getOrganization(),
            pi = this._permissionInteractor,
            aui = this._appUserInteractor;

        await pi.assertOrganizationReader(org.id);

        const auors = await pi.findAppUserOrganizationRoles({
            organizationId: org.id
        });

        const appUsers = Promise.all(auors.map(async (auor) => AppUser.parse({
            ...await aui.getUserById(auor.appUser.id),
            role: auor.role,
            organizations: [{
                reqType: ReqType.ORGANIZATION,
                id: org.id,
                name: org.name
            }]
        })))

        return appUsers
    }

    /**
     * Get a solution by id
     *
     * @param solutionId The id of the solution to get
     * @returns The solution
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async getSolutionById(solutionId: z.infer<typeof req.Solution>['id']): Promise<z.infer<typeof req.Solution>> {
        const org = await this.repository.getOrganization()
        await this._permissionInteractor.assertOrganizationReader(org.id);
        return this.repository.getSolutionById(solutionId);
    }

    /**
     * Get a solution by slug
     *
     * @param slug The slug of the solution to get
     * @returns The solution
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async getSolutionBySlug(slug: z.infer<typeof req.Solution>['slug']): Promise<z.infer<typeof req.Solution>> {
        const org = await this.repository.getOrganization()
        await this._permissionInteractor.assertOrganizationReader(org.id);
        return this.repository.getSolutionBySlug(slug);
    }

    /**
     * Assert that the solution slug is unique within the organization
     * @param slug The slug of the solution to check
     * @throws {MismatchException} If the solution slug is not unique within the organization
     */
    private async _assertSolutionSlugIsUnique(slug: z.infer<typeof req.Solution>['slug']): Promise<void> {
        const solutions = (await this.findSolutions({ slug }));

        if (solutions.length > 0)
            throw new MismatchException(`Solution with slug ${slug} already exists in the organization`);
    }

    /**
     * Update a solution by slug with the given properties
     *
     * @param slug The slug of the solution to update
     * @param props The properties to update
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async updateSolutionBySlug(slug: z.infer<typeof req.Solution>['slug'], props: Pick<Partial<z.infer<typeof req.Solution>>, 'name' | 'description'>): Promise<void> {
        const org = await this.repository.getOrganization(),
            currentUserId = this._permissionInteractor.userId;

        await this._permissionInteractor.assertOrganizationContributor(org.id);

        if (props.name)
            await this._assertSolutionSlugIsUnique(props.name);

        await this.repository.updateSolutionBySlug(slug, {
            modifiedById: currentUserId,
            modifiedDate: new Date(),
            ...props
        });
    }
}