import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import OrderConfirmation from '../../../../emails/OrderConfirmation';
import AdminOrderNotification from '../../../../emails/AdminOrderNotification';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  bouquetId?: string;
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

/**
 * Send a message via Telegram bot
 */
async function sendTelegramNotification(
  chatId: string, 
  message: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram bot token is not set');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error('Error sending Telegram notification:', result);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception sending Telegram notification:', error);
    return false;
  }
}

/**
 * Format order details for Telegram message
 */
function formatOrderForTelegram(
  orderNumber: string,
  orderDate: string,
  orderItems: any[],
  subtotal: number,
  shipping: number,
  total: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  address: string,
  paymentMethod: string,
  locale: string
): string {
  // Get translations based on locale (default to English)
  const t = translations[locale] || translations.en;
  
  // Format items
  const itemsList = orderItems.map(item => 
    `- ${item.name} x${item.quantity} - ${new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(item.price * item.quantity)}`
  ).join('\n');
  
  // Format currency
  const formatCurrency = (amount: number) => new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
  
  // Build the message
  return `
<b>${t.orderConfirmation}</b>
${t.orderNumber}${orderNumber}

<b>${customerName}</b>,
${t.thankYouMessage}

<b>${t.orderDetails}</b>
${t.orderDate}: ${orderDate}

<b>${t.orderSummary}</b>
${itemsList}

${t.subtotal}: ${formatCurrency(subtotal)}
${t.shipping}: ${formatCurrency(shipping)}
<b>${t.total}: ${formatCurrency(total)}</b>

<b>${t.shippingInfo}</b>
${address}
${customerPhone}
${customerEmail}

<b>${t.paymentMethod}</b>
${paymentMethod === 'cash' ? t.cashOnDelivery : t.cardPayment}

${t.questions}

${t.regards}
${t.teamName}
`;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      formData, 
      items, 
      orderId,
      orderDate,
      totalPrice, 
      shippingPrice = 100, 
      orderTotal,
      locale = 'pl' 
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

    // Generate unique order number if not provided
    const orderNumber = orderId || `ORD-${Date.now().toString().slice(-6)}`;
    const formattedOrderDate = orderDate || new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate totals if not provided
    const calculatedSubtotal = totalPrice || items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    const calculatedShipping = shippingPrice || 100;
    const calculatedTotal = orderTotal || calculatedSubtotal + calculatedShipping;

    // Handle customer notifications based on their preference
    const notificationType = formData.notificationType || 'email';
    
    // Send email notification if selected
    if (notificationType === 'email' || notificationType === 'both') {
      try {
        const customerEmailProps = {
          customerName: formData.name,
          orderNumber: orderNumber.toString(),
          orderDate: formattedOrderDate,
          orderItems,
          subtotal: calculatedSubtotal,
          shipping: calculatedShipping,
          total: calculatedTotal,
          address: formData.address,
          paymentMethod: formData.paymentMethod === 'cash' ? 
            (locale === 'en' ? 'Cash on Delivery' : 'Płatność przy odbiorze') : 
            (locale === 'en' ? 'Card Payment' : 'Płatność kartą'),
          locale
        };
        
        const customerEmail = await resend.emails.send({
          from: 'info@lafleur-lublin.com',
          to: formData.email,
          subject: locale === 'en' ? `Order Confirmation #${orderNumber}` : `Potwierdzenie zamówienia #${orderNumber}`,
          react: React.createElement(OrderConfirmation, customerEmailProps)
        });

        if (customerEmail.error) {
          console.error('Error sending customer email:', customerEmail.error);
          // Continue to other notifications even if email fails
        }
      } catch (customerEmailError) {
        console.error('Exception sending customer email:', customerEmailError);
        // Continue to other notifications even if email fails
      }
    }

    // Send Telegram notification to customer if selected
    if ((notificationType === 'telegram' || notificationType === 'both') && formData.telegramId) {
      try {
        const customerTelegramMessage = formatOrderForTelegram(
          orderNumber.toString(),
          formattedOrderDate,
          orderItems,
          calculatedSubtotal,
          calculatedShipping,
          calculatedTotal,
          formData.name,
          formData.email,
          formData.phone,
          formData.address,
          formData.paymentMethod === 'cash' ? 
            (locale === 'en' ? 'Cash on Delivery' : 'Płatność przy odbiorze') : 
            (locale === 'en' ? 'Card Payment' : 'Płatność kartą'),
          locale
        );
        
        const telegramSent = await sendTelegramNotification(
          formData.telegramId,
          customerTelegramMessage
        );
        
        if (!telegramSent) {
          console.error('Failed to send Telegram notification to customer');
        }
      } catch (telegramError) {
        console.error('Error sending Telegram notification to customer:', telegramError);
      }
    }

    // Send admin notifications - always send email to admin
    try {
      const adminEmailProps = {
        orderNumber: orderNumber.toString(),
        orderDate: formattedOrderDate,
        orderItems,
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        total: calculatedTotal,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod === 'cash' ? 
          (locale === 'en' ? 'Cash on Delivery' : 'Płatność przy odbiorze') : 
          (locale === 'en' ? 'Card Payment' : 'Płatność kartą'),
        locale
      };
      
      const adminEmail = await resend.emails.send({
        from: 'info@lafleur-lublin.com',
        to: process.env.ADMIN_EMAIL || 'admin@lafleur-lublin.com',
        subject: locale === 'en' ? `New Order Notification #${orderNumber}` : `Nowe zamówienie #${orderNumber}`,
        react: React.createElement(AdminOrderNotification, adminEmailProps)
      });

      if (adminEmail.error) {
        console.error('Error sending admin email:', adminEmail.error);
        // Don't return error here, try to send Telegram notification first
      }
    } catch (adminEmailError: any) {
      console.error('Exception sending admin email:', adminEmailError);
      // Don't return error here, try to send Telegram notification first
    }
    
    // Always send Telegram notification to shop owner if TELEGRAM_BOT_TOKEN is set
    try {
      const SHOP_OWNER_TELEGRAM_ID = '590002826'; // Hard-coded shop owner's Telegram ID
      
      const adminTelegramMessage = formatOrderForTelegram(
        orderNumber.toString(),
        formattedOrderDate,
        orderItems,
        calculatedSubtotal,
        calculatedShipping,
        calculatedTotal,
        formData.name,
        formData.email,
        formData.phone,
        formData.address,
        formData.paymentMethod === 'cash' ? 
          (locale === 'en' ? 'Cash on Delivery' : 'Płatność przy odbiorze') : 
          (locale === 'en' ? 'Card Payment' : 'Płatność kartą'),
        locale
      );
      
      const telegramSent = await sendTelegramNotification(
        SHOP_OWNER_TELEGRAM_ID,
        adminTelegramMessage
      );
      
      if (!telegramSent) {
        console.error('Failed to send Telegram notification to shop owner');
      }
    } catch (ownerTelegramError) {
      console.error('Error sending Telegram notification to shop owner:', ownerTelegramError);
    }

    // If we made it here, at least one notification method worked
    return NextResponse.json({ 
      success: true, 
      message: "Order received successfully",
      orderId: orderNumber
    });
  } catch (error: any) {
    console.error('Error processing order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 