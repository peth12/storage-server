export function generateBillNumber() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `BIL${yy}${mm}${dd}${rnd}`;
}