import { IExam } from "./IExam";

export interface IServerDns {
    Host: string,
    IPAddress: string,
    Port: string,
    ExamStatus: IExam | null
}