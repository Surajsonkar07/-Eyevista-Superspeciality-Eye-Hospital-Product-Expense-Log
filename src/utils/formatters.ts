import { ProductExpense } from '../types';

/**
 * Formats a numeric value into standard Indian Rupees (₹).
 * e.g. 150000 -> "₹1,50,000"
 */
export function formatRupees(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}

/**
 * Returns auto-matched current date and time formatted nicely.
 */
export function getAutoDateTime(dateObj: Date = new Date()) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strHours = String(hours).padStart(2, '0');

  const dateStr = `${day} ${month} ${year}`;
  const timeStr = `${strHours}:${minutes} ${ampm}`;

  return {
    timestamp: dateObj.toISOString(),
    date: dateStr,
    time: timeStr,
    fullDisplay: `${dateStr} at ${timeStr}`,
  };
}

/**
 * Downloads a simple CSV of product log items.
 */
export function exportProductsToCSV(products: ProductExpense[], sheetName?: string) {
  const headers = ['Sheet', 'Product Name', 'Price (INR)', 'Additional Information', 'Logged Date', 'Logged Time', 'Category', 'Notes'];
  const rows = products.map((p) => [
    `"${(sheetName || 'Expenses').replace(/"/g, '""')}"`,
    `"${p.productName.replace(/"/g, '""')}"`,
    p.price,
    `"${(p.additionalInfo || p.notes || '').replace(/"/g, '""')}"`,
    `"${p.date}"`,
    `"${p.time}"`,
    `"${p.category || 'General'}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = (sheetName || 'Expense_Log').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `Eyevista_${cleanName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
