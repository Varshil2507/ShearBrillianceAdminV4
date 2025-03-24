export const formatDate = (dateString: any): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: userTimeZone,
  };

  const formattedDate = new Intl.DateTimeFormat("en-CA", options).format(date);
  return formattedDate.replace(/\//g, "-");
};

export const otherFormatDate = (dateString: any): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateShort = (date: string | Date): string => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  return parsedDate.toISOString().split("T")[0];
};

export const formatTime = (time: string): string => {
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

export  const formatDateHours = (dateString: string): string => {
  const date = new Date(dateString);

  const padZero = (num: number) => String(num).padStart(2, "0");

  if (isNaN(date.getTime())) return ""; // Return an empty string if date is invalid
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getUTCDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = padZero(date.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // Convert 0 hours to 12 for AM/PM
  const formattedHours = padZero(hours);

  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
};

export const formatHours = (timeString: string) => {
  const padZero = (num: number) => String(num).padStart(2, "0");
  // Split the time string into hours, minutes, and seconds
  const [hoursStr, minutesStr] = timeString?.split(":");

  let hours = parseInt(hoursStr, 10);
  const minutes = padZero(parseInt(minutesStr, 10));
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12 || 12;

  return `${padZero(hours)}:${minutes} ${ampm}`;
};

