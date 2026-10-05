import { MarketProperty } from "./marketApi";

// 导出为 CSV
export function exportToCSV(data: MarketProperty[], filename = "market_properties.csv") {
  if (!data || !data.length) return;

  const headers = [
    "ID",
    "Property Name",
    "Estimated Price (USD)",
    "Square Footage",
    "Bedrooms",
    "Bathrooms",
    "Year Built",
    "Distance to City (miles)",
    "School Rating",
  ];

  const rows = data.map((item) => [
    item.id,
    `"${item.property_name.replace(/"/g, '""')}"`,
    item.predicted_price,
    item.square_footage,
    item.bedrooms,
    item.bathrooms,
    item.year_built,
    item.distance_to_city_center,
    item.school_rating,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 导出为 PDF (利用浏览器原生的无失真打印预览)
export function exportTableToPDF(elementId: string) {
  const content = document.getElementById(elementId);
  if (!content) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Market Analysis Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; }
          h2 { font-size: 20px; margin-bottom: 8px; }
          p { font-size: 12px; color: #64748b; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 600; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <h2>Residential Property Market Analysis</h2>
        <p>Report generated on: ${new Date().toLocaleString()}</p>
        ${content.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}