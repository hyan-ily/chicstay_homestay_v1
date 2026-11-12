import type { HoaDon, DonDatPhong, KhachHang, Phong } from '../types';

/**
 * Gửi hóa đơn tất toán qua Telegram (qua route /api/telegram/send-invoice).
 * Fire-and-forget: mọi lỗi chỉ ghi log, không ảnh hưởng luồng thanh toán.
 */
export const sendInvoiceToTelegram = (
  invoice: HoaDon,
  booking: DonDatPhong,
  customer?: KhachHang,
  room?: Phong
): void => {
  try {
    const payload = {
      maHoaDon: invoice.MaHoaDon,
      maDon: invoice.MaDon,
      khachHang: customer?.HoTen || 'Khách vãng lai',
      soDienThoai: customer?.SoDienThoai || '',
      phong: room ? `${booking.MaPhong} - ${room.TenPhong}` : booking.MaPhong,
      ngayNhan: booking.NgayNhanPhong,
      ngayTra: booking.NgayTraPhong,
      soDem: booking.SoDem,
      tienPhong: invoice.TienPhong,
      tienDichVu: invoice.TienDichVu,
      tienCocDaTra: invoice.TienCocDaTra,
      tienThanhToanKhiCheckOut: invoice.TienThanhToanKhiCheckOut,
      tongTien: invoice.TongTienDaThanhToan,
      phuongThuc: invoice.PhuongThuc,
      ngayXuat: invoice.NgayXuat,
    };
    fetch('/api/telegram/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn('Không gửi được hóa đơn qua Telegram:', err));
  } catch (err) {
    console.warn('Không gửi được hóa đơn qua Telegram:', err);
  }
};
