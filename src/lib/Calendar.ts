export interface Calendar {
    subjects: Subject[];
    bankHolidays: {
        date: string;
        desc: string;
    }[];
}

export interface Subject {
    id: string;
    name: string;
    path: string;
    lectures: Room[];
    exams: Room[]
}

export interface Room {
    date: string;
    room: string;
    desc?: string;
}

export interface Month {
    name: string;
    weeks: Date[][];
}


export interface BankHoliday {
    date: Date;
    desc: string;
}

export interface Event {
    path: string;
    name: string;
    id: string;
    date: Date;
    room: string;
    desc?: string;
}


