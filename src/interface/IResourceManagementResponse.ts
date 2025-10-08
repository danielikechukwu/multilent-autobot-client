import { StatusReport } from "../enums/StatusReport";
import { IMessage } from "./IMessage";

export interface IResourceManagementResponse {

    exam_status: string,
    response: IMessage,
}

export interface IResourceManagementResponseState {
    
    errors: number;
    value: IResourceManagementResponse | null;
}