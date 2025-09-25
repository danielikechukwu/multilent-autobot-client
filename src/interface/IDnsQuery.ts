import { IServerDns } from "./IServerDns";

export interface IDnsQueryStatus {
    Success: IServerDns,
    Failed: string | null;
} 