export function decodeWindowsDriveSeparator(uri: string): string {
  return uri.replace(
    /^file:\/\/\/([a-z])%3a(?=\/|$)/i,
    (_match, driveLetter: string) => `file:///${driveLetter}:`,
  );
}
