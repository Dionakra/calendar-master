import type { AcademicPath } from '../interfaces/view/AcademicPath'
import type { Day, Lecture, Week } from '../interfaces/view/Month'
import type Month from '../interfaces/view/Month'
import type { CalendarData } from '../interfaces/data/CalendarData'
import type Calendar from '../interfaces/view/Calendar'

import { calendar } from '../data/calendar'
import { paths } from '../data/paths'

const [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY] = [1, 2, 3, 4, 5]
const LAST_DAY = FRIDAY

export function getCalendar(): Calendar {
    return {
        months: getMonths(calendar),
        paths: getPaths(calendar)
    }
}

function getMonths(calendar: CalendarData): Array<Month> {
    const [firstDay, lastDay]: [Date, Date] = getFirstAndLastDay(calendar)
    let currentMonth: Month = {
        number: firstDay.getMonth(),
        weeks: []
    }

    const months: Array<Month> = [currentMonth]
    let currentDay = firstDay
    let previousDayOfTheWeek = currentDay.getDay()

    while (currentDay <= lastDay) {
        // If we are in another month, push it to the months array
        if (currentDay.getMonth() != currentMonth.number) {
            currentMonth = {
                number: currentDay.getMonth(),
                weeks: []
            }
            months.push(currentMonth)
        }

        // Once we are in the current month, add the day to the related week
        const currentDayOfTheWeek = currentDay.getDay()
        if (currentDayOfTheWeek >= MONDAY && currentDayOfTheWeek <= LAST_DAY) {
            // If we have a new week, add it to the month
            if (currentMonth.weeks.length == 0 || currentDayOfTheWeek < previousDayOfTheWeek) {
                const week: Week = {
                    days: Array(LAST_DAY)
                }
                currentMonth.weeks.push(week)
            }

            const day: Day = {
                date: currentDay,
                lectures: getLecturesForDay(currentDay),
                holiday: getHolidayForDay(currentDay),
                special: getSpecialForDay(currentDay)
            }

            const week = currentMonth.weeks[currentMonth.weeks.length - 1]
            week.days[currentDayOfTheWeek - 1] = day
            previousDayOfTheWeek = currentDayOfTheWeek
        }

        // Advance a day
        currentDay = nextDay(currentDay)
    }

    return months
}

function getPaths(calendar: CalendarData): Array<AcademicPath> {
    return paths.map(path => {
        const subjects = calendar.subjects
            .filter(subject => subject.path == path.id)
            .map(subject => {
                return {
                    id: subject.id,
                    name: subject.name
                }
            })

        return {
            id: path.id,
            color: path.color,
            name: path.name,
            subjects: subjects
        }
    })
}

////////////////
function getFirstAndLastDay(calendar: CalendarData): [Date, Date] {
    const dates: Date[] = calendar.subjects
        .flatMap(subject => subject.lectures
            .flatMap(lecture => lecture.date))
        .map(toDate)
        .sort((a, b) => a.getTime() - b.getTime())

    return [dates[0], dates[dates.length - 1]]
}

function getLecturesForDay(day: Date): Array<Lecture> {
    // Regular Lectures
    const lectures = calendar.subjects.flatMap(subject => {
        return subject.lectures.map(lecture => {
            return {
                subject: {
                    id: subject.id,
                    name: subject.name
                },
                date: toDate(lecture.date),
                room: lecture.room,
                color: paths.find(path => path.id == subject.path)?.color || "gray",
                isExam: false
            }
        })
    })

    // Exams
    const exams = calendar.subjects.flatMap(subject => {
        return subject.exams.map(exam => {
            return {
                subject: {
                    id: subject.id,
                    name: subject.name
                },
                date: toDate(exam.date),
                room: exam.room,
                color: paths.find(path => path.id == subject.path)?.color || "gray",
                isExam: true
            }
        })
    })

    return lectures.concat(exams)
        .filter(lecture => lecture.date.toDateString() == day.toDateString())
}

function getHolidayForDay(day: Date): string | undefined {
    return calendar.bankHolidays.
        find(holiday => toDate(holiday.date).toDateString() == day.toDateString())?.desc
}

function getSpecialForDay(day: Date): string | undefined {
    return calendar.special.
        find(special => toDate(special.date).toDateString() == day.toDateString())?.desc
}

function nextDay(day: Date): Date {
    const date = new Date(day);
    date.setDate(date.getDate() + 1);
    return date;
}

function toDate(date: string): Date {
    const dateParts = date.split("/");
    return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
}