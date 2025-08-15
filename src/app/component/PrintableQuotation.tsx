// PrintableQuotation.tsx
'use client';

type Props = {
  quotation: any;
};

export default function PrintableQuotation({ quotation }: Props) {
  const q = quotation;

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return `₱ ${num.toFixed(2)}`;
  };

  return (
    <div className="text-sm text-black w-[210mm] min-h-[297mm] px-10 py-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .customer-ref-container {
            display: flex !important;
            justify-content: space-between !important;
          }
          .ref-info {
            text-align: right !important;
            float: none !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

      `}</style>

      {/* Centered Logo */}
      <img 
        src="/logo.png" 
        alt="Company Logo" 
        className="mx-auto mb-6"
        style={{ 
          width: '800px',
          height: 'auto',
          maxHeight: '450px',
          display: 'block'
        }}
      />
            <div className="ref-section">
                <p><strong>Reference No:</strong> {quotation.refNo}</p>
                <p><strong>Date:</strong> {quotation.date}</p>
              </div>
      {/* Customer and Reference Section */}
      <div className="flex justify-between items-start mb-4">
        
        {/* Customer Details - Left Side */}
        <div>
          <p><strong>Customer Name:</strong> {q.name}</p>
          {q.position && <p><strong>Position:</strong> {q.position}</p>}
          {q.address && <p><strong>Address:</strong> {q.address}</p>}
          {q.through && <p><strong>Through:</strong> {q.through}</p>}
        </div>
      </div>

      {/* Subject and Description */}
      <div className="mb-4">
        {q.subject && <p><strong>Subject:</strong> {q.subject}</p>}
        {q.description && (
          <p className="mt-2 whitespace-pre-line"><strong>Description:</strong><br />{q.description}</p>
        )}
      </div>

      {/* Items Table */}
      {q.items && q.items.length > 0 && q.items.some((item: any) => item.description) && (
        <table className="w-full text-sm border border-gray-300 mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border text-right">Unit Price</th>
              <th className="p-2 border text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((item: any, i: number) => (
              item.description && (
                <tr key={i}>
                  <td className="p-2 border text-center">{item.qty || '-'}</td>
                  <td className="p-2 border">{item.description}</td>
                  <td className="p-2 border text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-2 border text-right">{formatCurrency(item.total)}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}

      {/* Totals Section */}
      <div className="text-right space-y-1 mt-8">
        <p><strong>Total:</strong> {formatCurrency(q.totalPrice)}</p>
        <p><strong>VAT (12%):</strong> {formatCurrency(q.vat)}</p>
        <p className="text-lg font-bold">Grand Total: {formatCurrency(q.grandTotal)}</p>
      </div>

      {/* Signature Lines */}
      <div className="signature mt-16 flex justify-between">
        <div className="signature-line w-1/3 text-center">
          <div className="border-t border-black mt-12 pt-1">Prepared by</div>
        </div>
        <div className="signature-line w-1/3 text-center">
          <div className="border-t border-black mt-12 pt-1">Approved by</div>
        </div>
      </div>
    </div>
  );
}