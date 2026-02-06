import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Color constants
    const primaryColor = [41, 128, 185]; // A nice blue
    const grayColor = [128, 128, 128];

    // Header
    // Invoice Title
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('INVOICE', 14, 22);

    // Company Info (Your Freelance Info)
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('My Freelance Business', 14, 30);
    doc.text('ROA Solutions', 14, 35);
    doc.text('Kurnool, Andhra Pradesh, India - 518003', 14, 40);
    doc.text('thewizard2164@gmail.com', 14, 45);

    // Client Info (Right aligned)
    const clientX = 140;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', clientX, 30);
    if (invoice.client) {
        doc.setFontSize(10);
        doc.setTextColor(...grayColor);
        doc.text(invoice.client.name, clientX, 35);
        doc.text(invoice.client.email, clientX, 40);
        if (invoice.client.address) {
            const addressLines = doc.splitTextToSize(invoice.client.address, 60);
            doc.text(addressLines, clientX, 45);
        }
    }

    // Invoice Details (Right Aligned, below client info)
    let yPos = 70;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, yPos);
    doc.text(`Issue Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, yPos + 6);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, yPos + 12);

    // Table
    const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
    const tableRows = [];

    if (invoice.items) {
        invoice.items.forEach(item => {
            const itemData = [
                item.description,
                item.quantity,
                `${invoice.currency} ${item.rate.toFixed(2)}`,
                `${invoice.currency} ${(item.quantity * item.rate).toFixed(2)}`
            ];
            tableRows.push(itemData);
        });
    }

    // Correct usage for jspdf-autotable in modular environments
    autoTable(doc, {
        startY: yPos + 20,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 10 },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    const pageWidth = doc.internal.pageSize.width;
    const rightMargin = 14;
    const rightX = pageWidth - rightMargin;

    doc.setFontSize(10);
    // Ensure numbers are checked before toFixed
    const subTotal = invoice.subTotal || 0;
    const taxRate = invoice.taxRate || 0;
    const taxAmount = invoice.taxAmount || 0;
    const total = invoice.total || 0;

    doc.text(`Subtotal: ${invoice.currency} ${subTotal.toFixed(2)}`, rightX, finalY, { align: 'right' });
    doc.text(`Tax (${taxRate}%): ${invoice.currency} ${taxAmount.toFixed(2)}`, rightX, finalY + 6, { align: 'right' });

    doc.setFontSize(14); // Bold total
    doc.setTextColor(...primaryColor);
    doc.text(`Total: ${invoice.currency} ${total.toFixed(2)}`, rightX, finalY + 15, { align: 'right' });

    // Notes
    if (invoice.notes) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Notes:", 14, finalY + 25);
        doc.setTextColor(...grayColor);
        const noteLines = doc.splitTextToSize(invoice.notes, 100);
        doc.text(noteLines, 14, finalY + 30);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for your business!", pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Save the PDF
    doc.save(`invoice_${invoice.invoiceNumber}.pdf`);
};
