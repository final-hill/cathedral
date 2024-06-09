import type Entity from "~/domain/Entity";
import Repository from "./Repository";

export default abstract class SlugRepository<E extends Entity> extends Repository<E> {
    abstract getSolutionBySlug(slug: string): Promise<E | undefined>;
}