import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

class ReportService {
  generateAuctionReport(auctions) {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.text('Auction Report', 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 25);

    const tableData = auctions.map((auction) => [auction.id, auction.title, auction.currentPrice.toLocaleString() + ' VND', auction.status, format(new Date(auction.endTime), 'PPp')]);

    doc.autoTable({
      head: [['ID', 'Title', 'Current Price', 'Status', 'End Time']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    return doc;
  }

  generatePaymentReport(payments) {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.text('Payment Report', 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 25);

    const tableData = payments.map((payment) => [payment.orderCode, payment.user.username, payment.amount.toLocaleString() + ' VND', payment.status, format(new Date(payment.createdAt), 'PPp')]);

    doc.autoTable({
      head: [['Order Code', 'User', 'Amount', 'Status', 'Date']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    return doc;
  }

  generateInvoice(payment) {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 15, { align: 'center' });

    // Add company info
    doc.setFontSize(10);
    doc.text('Online Auctions Company', 14, 30);
    doc.text('123 Auction Street', 14, 35);
    doc.text('Ho Chi Minh City, Vietnam', 14, 40);
    doc.text('Tel: (84) 123-456-789', 14, 45);

    // Add invoice details
    doc.text('Invoice No:', 14, 60);
    doc.text(payment.orderCode, 50, 60);
    doc.text('Date:', 14, 65);
    doc.text(format(new Date(payment.createdAt), 'PPp'), 50, 65);

    // Add customer info
    doc.text('Bill To:', 14, 80);
    doc.text(payment.user.fullName || payment.user.username, 50, 80);
    doc.text(payment.user.email, 50, 85);
    doc.text(payment.user.phoneNumber || '', 50, 90);

    // Add auction details
    doc.autoTable({
      head: [['Description', 'Amount']],
      body: [[`Auction: ${payment.auction.title}\nOrder Code: ${payment.orderCode}`, payment.amount.toLocaleString() + ' VND']],
      startY: 100,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Add payment info
    const finalY = doc.lastAutoTable.finalY || 120;
    doc.text('Payment Method:', 14, finalY + 10);
    doc.text(payment.paymentMethod, 50, finalY + 10);
    doc.text('Payment Status:', 14, finalY + 15);
    doc.text(payment.status, 50, finalY + 15);

    // Add total
    doc.setFontSize(12);
    doc.text('Total Amount:', 140, finalY + 20);
    doc.text(payment.amount.toLocaleString() + ' VND', 170, finalY + 20, { align: 'right' });

    // Add footer
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, finalY + 40, { align: 'center' });

    return doc;
  }

  downloadPDF(doc, filename) {
    doc.save(filename);
  }
}

export const reportService = new ReportService();
export default reportService;
