import UseCase from "~/application/UseCase";
import type Solution from "../domain/Solution";
import type SlugRepository from "~/application/SlugRepository";

export default class GetSolutionBySlugUseCase extends UseCase<string, Solution | undefined> {
    constructor(readonly repository: SlugRepository<Solution>) { super() }

    async execute(slug: string): Promise<Solution | undefined> {
        return this.repository.getSolutionBySlug(slug)
    }
}