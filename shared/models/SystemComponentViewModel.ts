export interface SystemComponentViewModel {
    id: string;
    reqId: string;
    name: string;
    description: string;
    parentComponent?: string;
    solutionId: string;
    lastModified: Date;
}