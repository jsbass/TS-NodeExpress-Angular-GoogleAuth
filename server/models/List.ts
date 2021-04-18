import { User } from "./User";

export default class List {
    id: string;
    name: string;
    users: { id: string, name: string, isOwner: boolean, isAdmin: boolean }[];
}