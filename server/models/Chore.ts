export default class Chore {
    id: string;
    name: string;
    listId: string;
    createdBy: { id: string, email: string, name: string };
    type: ChoreType;
    intervalData: string;
}

export enum ChoreType {
    Single,
    Recurring,
    Rolling
}