/** Maximum meaningful content date, independent of publication sort order. */
export const latestDate = (dates: (Date | undefined)[]): Date | undefined => {
  const times = dates
    .map((date) => date?.getTime())
    .filter((time): time is number => time !== undefined && Number.isFinite(time));
  return times.length ? new Date(Math.max(...times)) : undefined;
};

export const xmlEscape = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!,
  );
