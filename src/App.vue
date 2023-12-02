<template>
  <div class="bg-gray-50">

    <div v-if="calendar">
      <!-- LEGEND -->
      <div class="flex flex-wrap mx-auto justify-center">
        <div v-for="path in calendar.paths" class="w-1/2 sm:w-1/6 text-xs">
          <div class=" mx-0.5">
            <div v-for="subject in path.subjects" class="my-1 hover:cursor-pointer text-xs px-2 py-1 rounded"
              :class="selectedSubjects.includes(subject.id) ? `bg-${path.color}-200` : 'bg-gray-200'"
              @click="toggleSelectedSubject(subject.id)">
              <span class="font-bold">{{ subject.id }}</span>: {{ subject.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- CALENDAR -->
      <div class="flex flex-wrap">
        <div class="w-full md:w-1/2 " v-for="month in calendar.months" :key="month.number">
          <div class="mx-1 my-4 text-sm">
            <h2 class="text-xl text-center capitalize">{{ getMonthName(month.number) }}</h2>
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
                    <div v-for="day in week.days" class="w-1/5  h-auto pb-8"
                      :class="{ 'bg-gray-100': day != undefined && day.holiday != undefined && !isToday(day.date), 'bg-yellow-100': day != undefined && isToday(day.date) }">

                      <div v-if="day != undefined" class="h-full">
                        <p class="text-right pr-1 ">{{ day.date.getDate() }}</p>
                        <!-- HOLIDAYS -->
                        <div v-if="day.holiday" class="text-center mt-1">
                          {{ day.holiday }}
                        </div>

                        <!-- SPECIAL DAYS -->
                        <div v-if="day.special" class="text-center mt-1 h-full">
                          <div class="rounded-md px-2 py-1 my-2 mx-0.5 h-full bg-inma text-white" :title="day.special">
                            <div class="font-bold ">
                              {{ day.special }}
                            </div>
                          </div>
                        </div>

                        <!-- LECTURES -->
                        <div v-for="lecture in day.lectures" :class="[{
                          'hidden': !selectedSubjects.includes(
                            lecture.subject.id
                          )
                        }, `bg-${lecture.color}-200`
                        ]" class="flex justify-between rounded-md px-2 py-1 my-2 mx-0.5">
                          <span>{{ lecture.subject.id }} - {{ lecture.room }}</span>

                          <span v-if="lecture.isExam" class="relative flex h-3 w-3 my-auto">
                            <span :class="`bg-${lecture.color}-400`"
                              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                            <span :class="`bg-${lecture.color}-500`"
                              class=" relative inline-flex rounded-full h-3 w-3"></span>
                          </span>

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
import { getCalendar } from "./lib/services/CalendarService"
import type Calendar from './lib/interfaces/view/Calendar';

const LOCAL_STORAGE_KEY = "SELECTED_SUBJECTS";

export default defineComponent({
  data() {
    return {
      calendar: undefined as Calendar | undefined,
      selectedSubjects: [] as string[]
    }
  },
  mounted() {
    // Get data
    this.calendar = getCalendar()

    // Saved preferences
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved == null) {
      this.selectedSubjects = this.calendar.paths.flatMap((path) =>
        path.subjects.map((subject) => subject.id)
      );
    } else {
      this.selectedSubjects = saved.split(",")
    }
  },
  methods: {
    toggleSelectedSubject(subject: string) {
      const index = this.selectedSubjects.indexOf(subject);

      if (index >= 0) {
        this.selectedSubjects.splice(index, 1);
      } else {
        this.selectedSubjects.push(subject);
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, this.selectedSubjects.join(","));
    },
    getMonthName(monthNumber: number): string {
      const date = new Date();
      date.setMonth(monthNumber);

      return date.toLocaleString(navigator.language, {
        month: "long",
      });
    },
    isToday(day: Date): boolean {
      if (!day) {
        return false;
      }
      return day.toDateString() == new Date().toDateString();
    },
    getWeekDay(date: Date): string {
      return date.toLocaleString(window.navigator.language, { weekday: 'long' });
    },
  },
  computed: {
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
  }
})
</script>
