import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Printer, FileText, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { tafqeet } from './tafqeet';

type InvoiceItem = {
  id: string;
  itemNo: string;
  title: string;
  qty: number;
  price: number;
};

const LOGO_URL = 'https://www.raed.net/img?id=1542261';

const App: React.FC = () => {
  const [isEditing, setIsEditing] = useState(true);

  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceType, setInvoiceType] = useState('آجل');
  
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(`${currentHours}:${currentMinutes}`);
  const [dueDate, setDueDate] = useState(now.toISOString().split('T')[0]);
  const [cashier, setCashier] = useState('');

  const [customer, setCustomer] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', itemNo: '', title: '', qty: 1, price: 0 }
  ]);

  const handleClear = () => {
    if (!window.confirm('هل أنت متأكد من مسح كافة البيانات؟')) return;
    setInvoiceNo('');
    setInvoiceType('آجل');
    const dNow = new Date();
    setDate(dNow.toISOString().split('T')[0]);
    setTime(`${dNow.getHours().toString().padStart(2, '0')}:${dNow.getMinutes().toString().padStart(2, '0')}`);
    setDueDate(dNow.toISOString().split('T')[0]);
    setCashier('');
    setCustomer('');
    setCustomerAddress('');
    setCustomerPhone('');
    setItems([{ id: Date.now().toString(), itemNo: '', title: '', qty: 1, price: 0 }]);
  };

  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if there is data in URL
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    if (dataParam) {
      try {
        const decodedString = decodeURIComponent(atob(dataParam));
        const parsedData = JSON.parse(decodedString);
        
        if (parsedData.invoiceNo !== undefined) {
          setInvoiceNo(parsedData.invoiceNo || '');
          setInvoiceType(parsedData.invoiceType || '');
          setDate(parsedData.date || '');
          setTime(parsedData.time || '');
          setDueDate(parsedData.dueDate || '');
          setCashier(parsedData.cashier || '');
          setCustomer(parsedData.customer || '');
          setCustomerAddress(parsedData.customerAddress || '');
          setCustomerPhone(parsedData.customerPhone || '');
          setItems(parsedData.items || []);
          
          setIsEditing(false); // Automatically show preview
        }
      } catch (err) {
        console.error('Failed to parse invoice data from URL', err);
      }
    }
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), itemNo: '', title: '', qty: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totalQty = items.reduce((sum, item) => sum + Number(item.qty), 0);
  const totalSubTotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  const totalTax = totalSubTotal * 0.15;
  const grandTotal = totalSubTotal + totalTax;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!invoiceRef.current) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `invoice-${invoiceNo}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating image', err);
      alert('حدث خطأ أثناء محاولة حفظ الصورة');
    }
  };

  // Generate QR Code URL
  const generateInvoiceUrl = () => {
    const dataObj = {
      invoiceNo, invoiceType, date, time, dueDate, cashier,
      customer, customerAddress, customerPhone, items
    };
    const jsonStr = JSON.stringify(dataObj);
    const encoded = btoa(encodeURIComponent(jsonStr));
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
  };

  return (
    <div className="app-container">
      
      {isEditing ? (
        <div className="form-wrapper">
          <div className="actions" style={{ justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button className="btn btn-danger" onClick={handleClear}>
              <Trash2 size={16} /> مسح البيانات
            </button>
          </div>
          <div className="form-header">
            <img src={LOGO_URL} alt="Logo" className="form-logo" />
            <h2>إصدار فاتورة جديدة</h2>
          </div>

          <div className="form-section">
            <div className="form-section-title">بيانات العميل</div>
            <div className="form-grid">
              <div className="form-group">
                <label>اسم العميل</label>
                <input className="form-input" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="مثال: شركة الفنار للمشاريع" />
              </div>
              <div className="form-group">
                <label>العنوان</label>
                <input className="form-input" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="مثال: الرياض الطريق الدائري مخرج 6" />
              </div>
              <div className="form-group">
                <label>الهاتف</label>
                <input className="form-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="مثال: 0500000000" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">تفاصيل الفاتورة</div>
            <div className="form-grid">
              <div className="form-group">
                <label>رقم الفاتورة</label>
                <input className="form-input" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="مثال: 39" />
              </div>
              <div className="form-group">
                <label>نوع الفاتورة</label>
                <select className="form-input" value={invoiceType} onChange={e => setInvoiceType(e.target.value)}>
                  <option value="آجل">آجل</option>
                  <option value="كاش">كاش</option>
                  <option value="تحويل">تحويل</option>
                </select>
              </div>
              <div className="form-group">
                <label>التاريخ</label>
                <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>الوقت</label>
                <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label>تاريخ الاستحقاق</label>
                <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>الكاشير</label>
                <input className="form-input" value={cashier} onChange={e => setCashier(e.target.value)} placeholder="مثال: مدير النظام" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title" style={{ justifyContent: 'space-between' }}>
              <span>الأصناف والخدمات</span>
              <button className="btn btn-success" onClick={addItem} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                <Plus size={16} /> إضافة صنف
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="items-edit-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>رقم الصنف</th>
                    <th style={{ width: '40%' }}>الاسم / الوصف</th>
                    <th style={{ width: '15%' }}>الكمية</th>
                    <th style={{ width: '20%' }}>السعر</th>
                    <th style={{ width: '10%' }}>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td><input value={item.itemNo} onChange={e => updateItem(item.id, 'itemNo', e.target.value)} placeholder="مثال: 31" /></td>
                      <td><input value={item.title} onChange={e => updateItem(item.id, 'title', e.target.value)} placeholder="اسم الخدمة" /></td>
                      <td><input type="number" min="1" value={item.qty === 0 ? '' : item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} placeholder="1" /></td>
                      <td><input type="number" min="0" value={item.price === 0 ? '' : item.price} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} placeholder="580" /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-danger" onClick={() => removeItem(item.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'left', fontWeight: 'bold', padding: '8px 15px', border: 'none' }}>الإجمالي Total</td>
                    <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>{totalSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'left', fontWeight: 'bold', padding: '8px 15px', border: 'none' }}>الضريبة 15% Tax</td>
                    <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>{totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'left', fontWeight: 'bold', padding: '8px 15px', border: 'none', color: '#2563eb' }}>الإجمالي بالضريبة Due</td>
                    <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '1.1rem' }}>{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="actions" style={{ marginTop: '40px' }}>
            <button className="btn" onClick={() => setIsEditing(false)}>
              <FileText size={20} /> معاينة وإصدار الفاتورة
            </button>
          </div>

        </div>
      ) : (
        <>
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              <ArrowRight size={18} /> العودة للتعديل
            </button>
            <button className="btn btn-success" onClick={handleDownloadImage}>
              <ImageIcon size={18} /> حفظ كصورة
            </button>
            <button className="btn" onClick={handlePrint} style={{ backgroundColor: '#10b981' }}>
              <Printer size={18} /> طباعة الفاتورة (PDF)
            </button>
          </div>

          <div className="invoice-container" ref={invoiceRef}>
            <table className="print-table">
              <thead>
                <tr>
                  <td>
                    <div className="header-content compact">
                      <div className="header-top compact-header">
                        <div className="header-title">
                          <img src={LOGO_URL} alt="Logo" className="header-logo-print" />
                          <div>
                            <h1>مؤسسة عليه دخيل الله الغامدي</h1>
                            <div className="tax-no">رقم ضريبي 302119204200003 Tax No</div>
                          </div>
                        </div>
                        <div className="header-invoice-type">
                          فاتورة ضريبية
                        </div>
                      </div>

                      <div className="meta-table-container">
                        <table className="meta-table">
                          <tbody>
                            <tr>
                              <td className="meta-label">العميل<br/><span>Customer</span></td>
                              <td className="meta-val">{customer}</td>
                              <td className="meta-label">رقم الفاتورة<br/><span>Inv No</span></td>
                              <td className="meta-val">{invoiceNo}</td>
                            </tr>
                            <tr>
                              <td className="meta-label">العنوان<br/><span>Address</span></td>
                              <td className="meta-val">{customerAddress}</td>
                              <td className="meta-label">نوع الفاتورة<br/><span>Payment</span></td>
                              <td className="meta-val">{invoiceType}</td>
                            </tr>
                            <tr>
                              <td className="meta-label">الهاتف<br/><span>Phone</span></td>
                              <td className="meta-val">{customerPhone}</td>
                              <td className="meta-label">التاريخ<br/><span>Date</span></td>
                              <td className="meta-val">{date}</td>
                            </tr>
                            <tr>
                              <td className="meta-label">الكاشير<br/><span>Cashier</span></td>
                              <td className="meta-val">{cashier}</td>
                              <td className="meta-label">الوقت<br/><span>Time</span></td>
                              <td className="meta-val">{time}</td>
                            </tr>
                            <tr>
                              <td className="meta-label" style={{border: 'none', background: 'transparent'}}></td>
                              <td className="meta-val" style={{border: 'none'}}></td>
                              <td className="meta-label">تستحق في<br/><span>Due Date</span></td>
                              <td className="meta-val">{dueDate}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="main-content">
                      <table className="invoice-items">
                        <thead>
                          <tr>
                            <th style={{ width: '10%' }}>رقم الصنف<span className="en">Item No</span></th>
                            <th style={{ width: '35%' }}>اسم الخدمة<span className="en">Title</span></th>
                            <th style={{ width: '10%' }}>الكمية<span className="en">Qty</span></th>
                            <th style={{ width: '15%' }}>السعر<span className="en">Price</span></th>
                            <th style={{ width: '15%' }}>الإجمالي<span className="en">Total</span></th>
                            <th style={{ width: '10%' }}>الضريبة<span className="en">Tax</span></th>
                            <th style={{ width: '15%' }}>الإجمالي بالضريبة<span className="en">Grand Total</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => {
                            const itemSub = item.qty * item.price;
                            const itemTax = itemSub * 0.15;
                            const itemTotal = itemSub + itemTax;

                            return (
                              <tr key={item.id}>
                                <td>{item.itemNo}</td>
                                <td>{item.title}</td>
                                <td>{item.qty}</td>
                                <td>{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td>{itemSub.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td>{itemTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td>{itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2} style={{ borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}></td>
                            <td style={{ fontWeight: 'bold' }}>{totalQty}</td>
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              الإجمالي <span className="en" style={{display:'inline', fontSize:'0.85rem', marginLeft:'10px'}}>Total</span>
                            </td>
                            <td style={{ fontWeight: 'bold' }}>{totalSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} style={{ border: 'none' }}></td>
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              الضريبة 15% <span className="en" style={{display:'inline', fontSize:'0.85rem', marginLeft:'10px'}}>Tax</span>
                            </td>
                            <td style={{ fontWeight: 'bold' }}>{totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} style={{ border: 'none' }}></td>
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              الإجمالي بالضريبة <span className="en" style={{display:'inline', fontSize:'0.85rem', marginLeft:'10px'}}>Due</span>
                            </td>
                            <td style={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#fafafa' }}>{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="totals-container">
                        <div className="tafqeet-box">
                          <span className="tafqeet-label">المطلوب</span>
                          <span className="tafqeet-text">{tafqeet(grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <div className="footer-content">
                      <div className="footer-thanks">شكرا لزيارتكم</div>
                      <div className="footer-details">
                        <div className="qr-code">
                          <QRCodeSVG value={generateInvoiceUrl()} size={75} />
                        </div>
                        <div className="footer-text">
                          <p>جدة - شارع الاذاعة - حي النزلة - رقم المبنى 0311 ص . ب 23466 الرقم الإضافي 7718</p>
                          <p>تلفون : 6362212 جوال : 0555691297</p>
                          <p>السجل التجاري : 4030225755</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
