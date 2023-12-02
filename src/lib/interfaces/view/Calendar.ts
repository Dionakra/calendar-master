import type { AcademicPath } from "./AcademicPath";
import type Month from "./Month";

export default interface Calendar {
    months: Array<Month>
    paths: Array<AcademicPath>
}