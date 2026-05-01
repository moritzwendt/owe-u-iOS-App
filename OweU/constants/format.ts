export function fmt(n: number): string {
  return `${Math.abs(n).toFixed(2).replace('.', ',')} €`;
}

export function fmtTimestamp(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}. ${hour}:${min}`;
}
