export interface CalendarData {
    subjects: Subject[]
    bankHolidays: Special[]
    special: Special[]
}

export interface Subject {
    id: string
    name: string
    path: string
    lectures: Lecture[]
    exams: Lecture[]
}

export interface Lecture {
    date: string
    desc?: string
    room: string
}

export interface Special {
    date: string
    desc: string
}