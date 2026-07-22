export type DateOfBirthParts = {
  day: string;
  month: string;
  year: string;
};

const emptyDateOfBirthParts: DateOfBirthParts = { day: "", month: "", year: "" };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateOfBirthPartsFromIso(value: string): DateOfBirthParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return { ...emptyDateOfBirthParts };
  return { year: match[1], month: match[2], day: match[3] };
}

export function isoDateFromDateOfBirthParts(parts: DateOfBirthParts) {
  if (!/^\d{4}$/u.test(parts.year) || !/^\d{1,2}$/u.test(parts.month)) return "";
  if (!/^\d{1,2}$/u.test(parts.day)) return "";

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  if (year < 1000 || month < 1 || month > 12 || day < 1) return "";

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) return "";
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function yearsAgoIso(years: number, now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setFullYear(date.getFullYear() - years);
  return formatLocalDate(date);
}

export function isAdultBirthDate(value: string, now = new Date()) {
  const parts = dateOfBirthPartsFromIso(value);
  if (isoDateFromDateOfBirthParts(parts) !== value) return false;
  return value <= yearsAgoIso(18, now) && value >= yearsAgoIso(120, now);
}
