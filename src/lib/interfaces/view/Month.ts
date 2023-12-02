import type { Subject } from "./AcademicPath";

export default interface Month {
    number: number;
    weeks: Week[];
}

export interface Week {
    days: Day[]
}

export interface Day {
    date: Date
    holiday?: string
    special?: string
    lectures: Lecture[]
}

export interface Lecture {
    subject: Subject
    room: string
    isExam: boolean
    color: string
}