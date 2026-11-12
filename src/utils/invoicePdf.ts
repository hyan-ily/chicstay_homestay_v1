/**
 * Tạo PDF (base64) từ khối hóa đơn đang hiển thị: modal in hóa đơn sau check-out
 * (#chicstay-printable-invoice) hoặc modal hóa đơn tất toán (#chicstay-printable-checkout).
 * Thư viện được import động nên không làm nặng bundle ban đầu.
 * Trả về null nếu không tạo được; không ném lỗi ra ngoài.
 */
const INVOICE_ELEMENT_IDS = ['chicstay-printable-invoice', 'chicstay-printable-checkout'];

const waitForInvoiceElement = async (timeoutMs = 4000): Promise<HTMLElement | null> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const id of INVOICE_ELEMENT_IDS) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
};

export const buildCheckoutInvoicePdfBase64 = async (): Promise<string | null> => {
  let host: HTMLDivElement | null = null;
  try {
    const source = await waitForInvoiceElement();
    if (!source) return null;

    // Chờ ảnh (VietQR) tải xong để không bị trống trong PDF
    await new Promise((r) => setTimeout(r, 400));

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    // Nhân bản ra vùng ẩn, bỏ giới hạn chiều cao/cuộn để chụp đủ toàn bộ hóa đơn
    host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1;';
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.style.cssText = 'overflow:visible;max-height:none;height:auto;padding:24px;background:#fff;';
    host.appendChild(clone);
    document.body.appendChild(host);

    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;
    const img = canvas.toDataURL('image/jpeg', 0.92);

    let offset = 0;
    pdf.addImage(img, 'JPEG', 0, offset, pageW, imgH);
    while (imgH + offset > pageH) {
      offset -= pageH;
      pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, offset, pageW, imgH);
    }

    const dataUri = pdf.output('datauristring');
    return dataUri.substring(dataUri.indexOf('base64,') + 7);
  } catch (err) {
    console.warn('Không tạo được PDF hóa đơn:', err);
    return null;
  } finally {
    if (host && host.parentNode) host.parentNode.removeChild(host);
  }
};
