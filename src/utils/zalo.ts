import type { HoaDon, KhachHang } from '../types';
import { buildCheckoutInvoicePdfBase64 } from './invoicePdf';

/**
 * Gửi hóa đơn (PDF + tin nhắn) cho khách qua Zalo thông qua n8n.
 * Fire-and-forget: mọi lỗi chỉ ghi log, không ảnh hưởng luồng thanh toán.
 */
export const sendInvoiceToZalo = async (invoice: HoaDon, customer?: KhachHang): Promise<void> => {
  try {
    if (!customer?.SoDienThoai) return;
    const pdfBase64 = await buildCheckoutInvoicePdfBase64();
    const res = await fetch('/api/notify/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maHoaDon: invoice.MaHoaDon,
        maDon: invoice.MaDon,
        khachHang: customer.HoTen,
        soDienThoai: customer.SoDienThoai,
        tongTien: invoice.TongTienDaThanhToan,
        pdfBase64: pdfBase64 || '',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.success && !data.skipped) console.warn('Gửi hóa đơn Zalo thất bại:', data.error);
  } catch (err) {
    console.warn('Gửi hóa đơn Zalo thất bại:', err);
  }
};
