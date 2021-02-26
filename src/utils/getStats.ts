import moment from "moment";
import { DocumentType } from "@typegoose/typegoose";

export default async (
  dateInput?: string | Date,
  dateInputFrom?: string | Date
): Promise<any> => {
  // const starts: number = Date.now();
  // console.log("[DEBUG] Stats starts:", starts);
  const dateStr = moment(dateInput).format("YYYY-MM-DD"),
    dateStrFrom = dateInputFrom && moment(dateInputFrom).format("YYYY-MM-DD"),
    startOfDay = moment(dateInputFrom || dateInput)
      .startOf("day")
      .toDate(),
    endOfDay = moment(dateInput).endOf("day").toDate(),
    dateRangeStartStr = moment(dateInputFrom || dateInput)
      .subtract(6, "days")
      .format("YYYY-MM-DD"),
    startOfDateRange = moment(dateInput)
      .subtract(6, "days")
      .startOf("day")
      .toDate();

  return {};
};
