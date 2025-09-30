export interface IStartExam {
    
    candidate_id: number,
    exam_id: string,
    session_id: string,
    subject: string,
    time_started: Date | null,
}