import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  productName?: string;
  customBouquet?: {
    name: string;
  };
  image?: string;
}

interface EmailTranslations {
  orderConfirmation: string;
  orderNumber: string;
  greeting: string;
  thankYouMessage: string;
  orderDetails: string;
  orderDate: string;
  orderSummary: string;
  item: string;
  quantity: string;
  price: string;
  total: string;
  subtotal: string;
  shipping: string;
  shippingInfo: string;
  paymentMethod: string;
  cashOnDelivery: string;
  cardPayment: string;
  questions: string;
  regards: string;
  teamName: string;
  copyright: string;
  contactUs: string;
}

// Email translations
const translations: Record<string, EmailTranslations> = {
  en: {
    orderConfirmation: 'Order Confirmation',
    orderNumber: 'Order #',
    greeting: 'Hi',
    thankYouMessage: 'Thank you for your order! We\'ve received your purchase and are preparing your beautiful flowers with care.',
    orderDetails: 'Order Details',
    orderDate: 'Order Date',
    orderSummary: 'Order Summary',
    item: 'Item',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    shippingInfo: 'Shipping Information',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    cardPayment: 'Card Payment',
    questions: 'If you have any questions about your order, please contact our customer service.',
    regards: 'Best regards,',
    teamName: 'The Flower Shop Team',
    copyright: '© 2025 Flower Shop, All Rights Reserved',
    contactUs: 'If you have questions, contact us at info@lafleur-lublin.com'
  },
  uk: {
    orderConfirmation: 'Підтвердження замовлення',
    orderNumber: 'Замовлення №',
    greeting: 'Вітаємо',
    thankYouMessage: 'Дякуємо за ваше замовлення! Ми отримали ваше замовлення і зараз готуємо ваші прекрасні квіти з турботою.',
    orderDetails: 'Деталі замовлення',
    orderDate: 'Дата замовлення',
    orderSummary: 'Підсумок замовлення',
    item: 'Товар',
    quantity: 'Кількість',
    price: 'Ціна',
    total: 'Загальна сума',
    subtotal: 'Проміжний підсумок',
    shipping: 'Доставка',
    shippingInfo: 'Інформація про доставку',
    paymentMethod: 'Спосіб оплати',
    cashOnDelivery: 'Оплата при доставці',
    cardPayment: 'Оплата карткою',
    questions: 'Якщо у вас виникли питання щодо вашого замовлення, зверніться до нашої служби підтримки.',
    regards: 'З повагою,',
    teamName: 'Команда Квіткового Магазину',
    copyright: '© 2025 Квітковий Магазин, Всі права захищені',
    contactUs: 'Якщо у вас є питання, зв\'яжіться з нами за адресою info@lafleur-lublin.com'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { 
      formData, 
      items, 
      totalPrice, 
      locale 
    } = await request.json();

    // Get translations based on locale (default to English)
    const t = translations[locale] || translations.en;

    // Format order items for email
    const orderItems = items.map((item: CartItem) => ({
      name: item.productName || item.customBouquet?.name || 'Custom Item',
      quantity: item.quantity,
      price: item.price,
      image: item.image || ''
    }));

    // Generate unique order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const orderDate = new Date().toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US');

    // Create HTML for order items
    const orderItemsHtml = orderItems.map((item: { name: string; quantity: number; price: number; image: string }) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₴${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">₴${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8bbd0; padding: 20px; text-align: center; color: #880e4f; }
          .content { padding: 20px; background: #fff; }
          .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8bbd0; color: #880e4f; text-align: left; padding: 10px; }
          .total-row { font-weight: bold; background-color: #fce4ec; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${t.orderConfirmation}</h1>
            <p>${t.orderNumber}${orderNumber}</p>
          </div>
          <div class="content">
            <p>${t.greeting} ${formData.name},</p>
            <p>${t.thankYouMessage}</p>
            
            <h2>${t.orderDetails}</h2>
            <p><strong>${t.orderNumber}</strong> ${orderNumber}<br>
            <strong>${t.orderDate}:</strong> ${orderDate}</p>
            
            <h2>${t.orderSummary}</h2>
            <table>
              <thead>
                <tr>
                  <th>${t.item}</th>
                  <th>${t.quantity}</th>
                  <th>${t.price}</th>
                  <th>${t.total}</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 10px; text-align: right;">${t.subtotal}:</td>
                  <td style="padding: 10px;">₴${totalPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;">${t.shipping}:</td>
                  <td style="padding: 10px;">₴100.00</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="padding: 10px; text-align: right;">${t.total}:</td>
                  <td style="padding: 10px;">₴${(totalPrice + 100).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <h2>${t.shippingInfo}</h2>
            <p>${formData.address}, ${formData.city}</p>
            
            <h2>${t.paymentMethod}</h2>
            <p>${formData.paymentMethod === 'cash' ? t.cashOnDelivery : t.cardPayment}</p>
            
            <p>${t.questions}</p>
            
            <p>${t.regards}<br>
            ${t.teamName}</p>
          </div>
          <div class="footer">
            <p>${t.copyright}</p>
            <p>${t.contactUs}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    try {
      const customerEmail = await resend.emails.send({
        from: 'info@lafleur-lublin.com',
        to: formData.email,
        subject: `${t.orderConfirmation} #${orderNumber}`,
        html: htmlContent,
      });

      if (customerEmail.error) {
        console.error('Error sending customer email:', customerEmail.error);
        // Continue to admin email even if customer email fails
      }
    } catch (customerEmailError) {
      console.error('Exception sending customer email:', customerEmailError);
      // Continue to admin email even if customer email fails
    }

    // Send notification to admin (separate try/catch to ensure it runs even if customer email fails)
    try {
      const adminEmail = await resend.emails.send({
        from: 'info@lafleur-lublin.com',
        to: process.env.ADMIN_EMAIL || 'admin@lafleur-lublin.com',
        subject: `${t.orderNumber}${orderNumber}`,
        html: htmlContent,
      });

      if (adminEmail.error) {
        console.error('Error sending admin email:', adminEmail.error);
        return NextResponse.json({ error: adminEmail.error.message }, { status: 500 });
      }
    } catch (adminEmailError: any) {
      console.error('Exception sending admin email:', adminEmailError);
      return NextResponse.json({ error: adminEmailError.message }, { status: 500 });
    }

    // If we made it here, at least the admin email was sent successfully
    return NextResponse.json({ 
      success: true, 
      message: "Order received successfully"
    });
  } catch (error: any) {
    console.error('Error processing order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 