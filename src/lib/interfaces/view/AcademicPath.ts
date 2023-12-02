export interface AcademicPath {
    id: string
    color: string
    name: string
    subjects: Subject[]
}

export interface Subject {
    id: string
    name: string
}