export function sanitizeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // CSV Formula Injection mitigation: prefix dangerous characters with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export function generateCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvField).join(",");
  const dataLines = rows.map((row) => row.map(sanitizeCsvField).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}
