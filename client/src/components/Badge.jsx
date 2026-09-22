export default function Badge({ value, type }) {
  if (!value) return null;
  const cls = String(value).toLowerCase().replace(/\s+/g, '_');
  return <span className={`badge ${type || cls}`}>{value}</span>;
}
