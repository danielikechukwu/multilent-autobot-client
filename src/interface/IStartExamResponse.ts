import { IStartExam } from "./IStartExam";

export interface IStartExamResponse {

    running: boolean,
    data: IStartExam | null
}