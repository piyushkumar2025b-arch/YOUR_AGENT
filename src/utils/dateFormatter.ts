import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export function formatRelativeTime(dateInput: string | number | Date): string {
  if (!dateInput) return "";
  return dayjs(dateInput).fromNow();
}

export function formatDisplayDate(dateInput: string | number | Date, format = "MMM D, YYYY h:mm A"): string {
  if (!dateInput) return "";
  return dayjs(dateInput).format(format);
}

export function getCurrentTimestamp(): string {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}
