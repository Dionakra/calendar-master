<template>
  <div class="bg-gray-50">
    <!-- LEGEND -->
    <div class="flex flex-wrap mx-auto justify-center">
      <div v-for="path in paths" class="w-1/2 sm:w-1/6 text-xs">
        <div class=" mx-0.5">
          <p class="text-sm pl-1">{{ path.name }}</p>
          <div v-for="subject in getSubjectsForPath(path.id)" class="my-1 hover:cursor-pointer text-xs px-2 py-1 rounded"
            :class="selectedSubjects.includes(subject.id) ? getPathBackground(path.id) : 'bg-gray-200'"
            @click="toggleSelectedSubject(subject.id)">
            <span class="font-bold">{{ subject.id }}</span>: {{ subject.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- CALENDAR -->
    <div class="flex flex-wrap">
      <div class="w-full md:w-1/2 " v-for="month in months" :key="month.name">
        <div class="mx-1 my-4 text-sm">
          <h2 class="text-xl text-center capitalize">{{ month.name }}</h2>
          <div class=" rounded-md shadow-md bg-white border border-gray-50">
            <div class="capitalize flex text-center text-white py-1 bg-inma rounded-t-md font-bold">
              <div class="w-1/5">
                {{ monday }}
              </div>
              <div class="w-1/5">
                {{ tuesday }}
              </div>
              <div class="w-1/5">
                {{ wednesday }}
              </div>
              <div class="w-1/5">
                {{ thursday }}
              </div>
              <div class="w-1/5">
                {{ friday }}
              </div>
            </div>

            <div class="text-sm text-gray-700 border-t border-gray-100 ">
              <div class="w-full" v-for="week in month.weeks">
                <div class="flex w-full divide-x divide-gray-100">
                  <div v-for="day in week" class="w-1/5  h-auto pb-8"
                    :class="{ 'bg-gray-100': getHolidaysForDay(day) != undefined && !isToday(day), 'bg-yellow-100': isToday(day) }">
                    <div v-if="day != undefined" class="h-full">
                      <p class="text-right pr-1 ">{{ day.getDate() }}</p>
                      <!-- HOLIDAYS -->
                      <div v-if="getHolidaysForDay(day) != undefined" class="text-center mt-1">
                        {{ getHolidaysForDay(day)?.desc }}
                      </div>

                      <!-- SPECIAL DAYS -->
                      <div v-if="getSpecial(day).length > 0" class="text-center mt-1 h-full">
                        <div v-for="special in getSpecial(day)"
                          class="rounded-md px-2 py-1 my-2 mx-0.5 h-full bg-inma text-white" :title="special.desc">
                          <div class="font-bold ">
                            {{ special.desc }}
                          </div>
                        </div>
                      </div>



                      <!-- EXAMS -->
                      <div v-for="lecture in getExamsForDay(day)"
                        class="flex justify-between rounded-md px-2 py-1 my-2 mx-0.5 "
                        :class="getLectureBackground(lecture)" :title="'EXAM: ' + lecture.name">
                        <span>{{ lecture.id }} - {{ lecture.room }}</span>
                        <span class="relative flex h-3 w-3 my-auto">
                          <span :class="getExamPulseColor(lecture)"
                            class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-3 w-3"
                            :class="getExamDotColor(lecture)"></span>
                        </span>

                      </div>

                      <!-- NORMAL CLASSES -->
                      <div class="my-1">
                        <div v-for="lecture in getClassesForDay(day)" class="rounded-md px-2 py-1 my-2 mx-0.5"
                          :class="getLectureBackground(lecture)" :title="lecture.name">
                          {{ lecture.id }} - {{ lecture.room }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { type BankHoliday, type Calendar, type Event, type Month, type Subject } from "./lib/Calendar";
const pathColors: { id: string, color: string, name: string }[] = [
  { id: "GTI", color: "blue", name: "Gestión TI" },
  { id: "IC", color: "purple", name: "Ingeniería Cloud" },
  { id: "ID", color: "orange", name: "Ingeniería Datos" },
  { id: "SE", color: "pink", name: "Software empresarial" },
  { id: "IS", color: "red", name: "Infraestructura y Seguridad" },
  { id: "I+D", color: "green", name: "Investigación y desarrollo" }
]
const LOCAL_STORAGE_KEY="SELECTED_SUBJECTS";

export default defineComponent({
  data() {
    return {
      calendar: undefined as Calendar | undefined,
      selectedSubjects: [] as string[],
      holidays: [] as BankHoliday[],
      months: [] as Month[],
      exams: [] as Event[],
      special: [] as { date: Date, desc: string }[]
    }
  },
  mounted() {
    this.loadCalendar()
  },
  methods: {
    loadCalendar() {
      fetch("calendar.json")
        .then(data => data.json())
        .then(calendar => {
          this.calendar = calendar
          this.months = this.getMonths(calendar)
          this.holidays = this.getHolidays(calendar)
          this.exams = this.getExams(calendar)
          this.special = calendar.special.map((event: { date: string; desc: any; }) => {
            return {
              date: this.toDate(event.date),
              desc: event.desc
            }
          })

          const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
          console.log(saved)
          if(saved == null){
            this.selectedSubjects = this.calendar?.subjects.map(subject => subject.id) || []
          } else {
            this.selectedSubjects = saved.split(",")
          }
          
        })
    },
    getMonths(calendar: Calendar): Month[] {
      const dates: Date[] = calendar.subjects
        .flatMap(subject => subject.lectures
          .flatMap(lecture => lecture.date))
        .map(this.toDate)
        .sort((a, b) => a.getTime() - b.getTime())

      const first = dates[0];
      const last = dates[dates.length - 1]

      let currentMonth: Month = {
        name: first.toLocaleString('default', { month: 'long' }),
        weeks: []
      }
      const arr: Month[] = [currentMonth]
      let currentDate = first;
      while (currentDate <= last) {
        // Only take into account Monday to Thursday
        const dayNo: number = currentDate.getDay()
        const weekNo: number = this.getWeekNumber(currentDate)

        if (dayNo >= 1 && dayNo <= 5) {
          const monthName: string = currentDate.toLocaleString('default', { month: 'long' });
          if (currentMonth.name != monthName) {
            currentMonth.weeks = currentMonth.weeks.filter(c => c != undefined)
            currentMonth = {
              name: currentDate.toLocaleString('default', { month: 'long' }),
              weeks: []
            }

            arr.push(currentMonth)
          }
          if (currentMonth.weeks[weekNo] == undefined) {
            currentMonth.weeks[weekNo] = []
          }
          currentMonth.weeks[weekNo][dayNo - 1] = currentDate
        }
        currentDate = this.nextDay(currentDate);
      }

      return arr
    },
    getHolidays(calendar: Calendar): BankHoliday[] {
      return calendar.bankHolidays.map(bh => {
        return {
          date: this.toDate(bh.date),
          desc: bh.desc
        }
      })
    },
    getExams(calendar: Calendar): Event[] {
      return calendar.subjects.flatMap(subject => {
        return subject.exams.map(exam => {
          return {
            id: subject.id,
            name: subject.name,
            path: subject.path,
            room: exam.room,
            desc: exam.desc,
            date: this.toDate(exam.date)
          }
        })
      })
    },
    getSpecial(day: Date): { date: Date, desc: string }[] {
      if (!day) {
        return []
      }
      return this.special.filter(event => event.date.toDateString() == day.toDateString())
    },
    getHolidaysForDay(day: Date): BankHoliday | undefined {
      if (!day) {
        return undefined
      }
      return this.holidays.find(h => h.date.toDateString() == day.toDateString())
    },
    getExamsForDay(day: Date): Event[] {
      if (!day) {
        return []
      }

      const dateStr = day.toDateString()
      return this.exams.filter(exam => {
        return exam.date.toDateString() == dateStr && this.selectedSubjects.includes(exam.id)
      })
    },
    getClassesForDay(day: Date): Event[] {
      if (!this.calendar) {
        return []
      }
      const dateStr = day.toDateString()
      return this.calendar.subjects.flatMap(subject => {
        return subject.lectures.filter(lecture => {
          return this.toDate(lecture.date).toDateString() == dateStr && this.selectedSubjects.includes(subject.id)
        })
          .map(lecture => {
            return {
              id: subject.id,
              name: subject.name,
              path: subject.path,
              room: lecture.room,
              date: this.toDate(lecture.date)
            }
          })
      })
    },
    getPathColor(path: string): string {
      return pathColors.find(pc => pc.id == path)?.color || "gray"
    },
    getPathBackground(path: string): string {
      return `bg-${this.getPathColor(path)}-200`
    },
    getLectureBackground(event: Event): string {
      return `bg-${this.getPathColor(event.path)}-200`
    },
    getExamDotColor(event: Event): string {
      return `bg-${this.getPathColor(event.path)}-500`
    },
    getExamPulseColor(event: Event): string {
      return `bg-${this.getPathColor(event.path)}-400`
    },
    toDate(date: string): Date {
      var dateParts = date.split("/");
      return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
    },
    isToday(day: Date): boolean {
      if (!day) {
        return false
      }
      return day.toDateString() == new Date().toDateString()
    },
    getWeekNumber(day: Date): number {
      const startDate = new Date(day.getFullYear(), 0, 0)
      const days = Math.floor((day.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))

      return Math.floor(days / 7);

    },
    nextDay(day: Date): Date {
      const date = new Date(day);
      date.setDate(date.getDate() + 1);
      return date;
    },
    getWeekDay(date: Date): string {
      return date.toLocaleString(window.navigator.language, { weekday: 'long' });
    },
    getSubjectsForPath(path: string): { id: string, name: string }[] {
      if (!this.calendar) {
        return []
      }

      return this.calendar?.subjects.filter(subject => subject.path == path).map(subject => {
        return {
          id: subject.id,
          name: subject.name
        }
      })
    },
    toggleSelectedSubject(subject: string) {
      const index = this.selectedSubjects.indexOf(subject)

      if (index >= 0) {
        this.selectedSubjects.splice(index, 1)
      } else {
        this.selectedSubjects.push(subject)
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, this.selectedSubjects.join(","))
    }
  },
  computed: {
    subjects(): string[] {
      return this.calendar?.subjects.map(subject => subject.name) || []
    },
    monday(): string {
      return this.getWeekDay(new Date("10/23/2023"))
    },
    tuesday(): string {
      return this.getWeekDay(new Date("10/24/2023"))
    },
    wednesday(): string {
      return this.getWeekDay(new Date("10/25/2023"))
    },
    thursday(): string {
      return this.getWeekDay(new Date("10/26/2023"))
    },
    friday(): string {
      return this.getWeekDay(new Date("10/27/2023"))
    },
    paths(): { id: string, name: string, color: string }[] {
      return pathColors
    }
  }
})
</script>
