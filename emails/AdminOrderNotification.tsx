import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components';
import { FC } from 'react';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type AdminOrderNotificationProps = {
  orderNumber: string;
  orderDate: string;
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  paymentMethod: string;
  locale?: string;
};

// Default translations
const translations = {
  en: {
    previewText: 'New order notification',
    orderNotification: 'New Order Notification',
    orderDetails: 'Order Details',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderSummary: 'Order Summary',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    customerInfo: 'Customer Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    systemMessage: 'This is an automated system message. Please do not reply to this email.'
  },
  pl: {
    previewText: 'Powiadomienie o nowym zamówieniu',
    orderNotification: 'Powiadomienie o nowym zamówieniu',
    orderDetails: 'Szczegóły zamówienia',
    orderNumber: 'Numer zamówienia',
    orderDate: 'Data zamówienia',
    orderSummary: 'Podsumowanie zamówienia',
    quantity: 'Ilość',
    subtotal: 'Suma częściowa',
    shipping: 'Dostawa',
    total: 'Razem',
    customerInfo: 'Informacje o kliencie',
    name: 'Imię i nazwisko',
    email: 'Email',
    phone: 'Telefon',
    shippingAddress: 'Adres dostawy',
    paymentMethod: 'Metoda płatności',
    systemMessage: 'To jest automatyczna wiadomość systemowa. Prosimy nie odpowiadać na ten email.'
  }
};

export const AdminOrderNotification: FC<AdminOrderNotificationProps> = ({
  orderNumber,
  orderDate,
  orderItems,
  subtotal,
  shipping,
  total,
  customerName,
  customerEmail,
  customerPhone,
  address,
  paymentMethod,
  locale = 'pl', // Default to Polish
}) => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // Use translations based on locale, defaulting to Polish if not specified
  const t = translations[locale as keyof typeof translations] || translations.pl;

  return (
    <Html>
      <Head />
      <Preview>{t.previewText} - #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="120"
              height="36"
              alt="Flower Shop"
              style={logo}
            />
          </Section>
          <Section style={content}>
            <Heading style={heading}>{t.orderNotification}</Heading>
            
            <Section style={orderDetails}>
              <Heading as="h2" style={subheading}>{t.orderDetails}</Heading>
              <Text style={paragraph}>
                <strong>{t.orderNumber}:</strong> {orderNumber}<br />
                <strong>{t.orderDate}:</strong> {orderDate}
              </Text>
            </Section>

            <Section style={orderSummary}>
              <Heading as="h2" style={subheading}>{t.orderSummary}</Heading>

              {orderItems.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={itemDetails}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemMeta}>{t.quantity}: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text>₴{(item.price * item.quantity).toFixed(2)}</Text>
                  </Column>
                </Row>
              ))}

              <Hr style={divider} />

              <Row style={subtotalRow}>
                <Column><Text style={subtotalLabel}>{t.subtotal}</Text></Column>
                <Column style={subtotalValue}><Text>₴{subtotal.toFixed(2)}</Text></Column>
              </Row>

              <Row style={subtotalRow}>
                <Column><Text style={subtotalLabel}>{t.shipping}</Text></Column>
                <Column style={subtotalValue}><Text>₴{shipping.toFixed(2)}</Text></Column>
              </Row>

              <Row style={totalRow}>
                <Column><Text style={totalLabel}>{t.total}</Text></Column>
                <Column style={totalValue}><Text>₴{total.toFixed(2)}</Text></Column>
              </Row>
            </Section>

            <Section style={customerInfoSection}>
              <Heading as="h2" style={subheading}>{t.customerInfo}</Heading>
              <Text style={paragraph}>
                <strong>{t.name}:</strong> {customerName}<br />
                <strong>{t.email}:</strong> {customerEmail}<br />
                <strong>{t.phone}:</strong> {customerPhone}<br />
                <strong>{t.shippingAddress}:</strong> {address}<br />
                <strong>{t.paymentMethod}:</strong> {paymentMethod}
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={systemText}>
              {t.systemMessage}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminOrderNotification;

// Styles
const main = {
  backgroundColor: '#f9f9f9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const logoContainer = {
  padding: '20px 0',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '20px',
  backgroundColor: '#ffffff',
  border: '1px solid #e6e6e6',
  borderRadius: '5px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '500',
  color: '#ec4899', // Pink color to match theme
  padding: '17px 0 0',
  textAlign: 'center' as const,
};

const orderDetails = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f0f9ff', // Light blue background
  borderRadius: '4px',
};

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4043',
};

const orderSummary = {
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
  margin: '20px 0',
};

const itemRow = {
  padding: '8px 0',
  borderBottom: '1px solid #e6e6e6',
};

const itemDetails = {
  width: '80%',
};

const itemName = {
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  padding: '0',
};

const itemMeta = {
  fontSize: '12px',
  color: '#747474',
  margin: '4px 0 0',
  padding: '0',
};

const itemPrice = {
  width: '20%',
  textAlign: 'right' as const,
  verticalAlign: 'top',
};

const divider = {
  borderTop: '1px solid #e6e6e6',
  margin: '20px 0',
};

const subtotalRow = {
  padding: '4px 0',
};

const subtotalLabel = {
  fontSize: '14px',
  color: '#747474',
  margin: '0',
  padding: '0',
};

const subtotalValue = {
  textAlign: 'right' as const,
  fontSize: '14px',
};

const totalRow = {
  padding: '8px 0',
  fontWeight: 'bold',
};

const totalLabel = {
  fontSize: '16px',
  margin: '0',
  padding: '0',
};

const totalValue = {
  textAlign: 'right' as const,
  fontSize: '16px',
};

const customerInfoSection = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fff8f8', // Light pink background
  borderRadius: '4px',
};

const subheading = {
  fontSize: '18px',
  letterSpacing: '-0.3px',
  lineHeight: '1.3',
  fontWeight: '500',
  color: '#484848',
  padding: '0',
  margin: '0 0 10px',
};

const systemText = {
  fontSize: '12px',
  color: '#999999',
  fontStyle: 'italic' as const,
  textAlign: 'center' as const,
  margin: '20px 0 0',
}; 