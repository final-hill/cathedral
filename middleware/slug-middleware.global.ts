export default defineNuxtRouteMiddleware(async (to, from) => {
    const slug = to.params.slug,
        // An error is thrown if these are imported at the top of the file
        SolutionInteractor = (await import('../application/SolutionInteractor')).default,
        SolutionRepository = (await import('../data/SolutionRepository')).default

    if (slug) {
        const solutionInteractor = new SolutionInteractor(new SolutionRepository()),
            solution = (await solutionInteractor.getAll({
                slug: typeof slug === 'string' ? slug : slug[0]
            }))[0]

        if (!solution)
            return navigateTo({ name: 'Solutions' })
    }
})