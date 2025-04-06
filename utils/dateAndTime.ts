export const formatDateTime = (dateString: string) => {
  // Create date object directly from the UTC string
  // This automatically handles the conversion to local timezone
  const date = new Date(dateString);

  // Get user's browser locale, fallback to 'en-US'
  const userLocale =
    typeof navigator !== "undefined" ? navigator.language : "en-US";

  // Format the main date/time components
  const formattedDate = date.toLocaleString(userLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset >= 0 ? "+" : "-";

  // Build timezone string
  const timezone = `GMT${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  // Combine date and timezone
  return formattedDate.replace(
    /\s(AM|PM)/,
    (_, period) => ` ${period.toLowerCase()} ${timezone}`
  );
};
