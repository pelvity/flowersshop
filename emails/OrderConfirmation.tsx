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

type OrderConfirmationProps = {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: string;
  paymentMethod: string;
  locale?: string;
};

// Default translations
const translations = {
  en: {
    previewText: 'Your flower shop order confirmation',
    orderConfirmation: 'Order Confirmation',
    greeting: 'Hi',
    thankYou: 'Thank you for your order! We\'ve received your purchase and are preparing your beautiful flowers with care.',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderSummary: 'Order Summary',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    shippingInformation: 'Shipping Information',
    paymentMethod: 'Payment Method',
    questions: 'If you have any questions about your order, please contact our customer service.',
    regards: 'Best regards,',
    teamName: 'The Flower Shop Team',
    copyright: '© 2025 Flower Shop, All Rights Reserved',
    contactUs: 'If you have questions, contact us at'
  },
  pl: {
    previewText: 'Potwierdzenie zamówienia w kwiaciarni',
    orderConfirmation: 'Potwierdzenie zamówienia',
    greeting: 'Witaj',
    thankYou: 'Dziękujemy za Twoje zamówienie! Otrzymaliśmy Twoje zamówienie i przygotowujemy Twoje piękne kwiaty z troską.',
    orderNumber: 'Numer zamówienia',
    orderDate: 'Data zamówienia',
    orderSummary: 'Podsumowanie zamówienia',
    quantity: 'Ilość',
    subtotal: 'Suma częściowa',
    shipping: 'Dostawa',
    total: 'Razem',
    shippingInformation: 'Informacje o dostawie',
    paymentMethod: 'Metoda płatności',
    questions: 'Jeśli masz jakiekolwiek pytania dotyczące zamówienia, skontaktuj się z naszym działem obsługi klienta.',
    regards: 'Z poważaniem,',
    teamName: 'Zespół Kwiaciarni',
    copyright: '© 2025 Kwiaciarnia, Wszelkie prawa zastrzeżone',
    contactUs: 'Jeśli masz pytania, skontaktuj się z nami pod adresem'
  }
};

export const OrderConfirmation: FC<OrderConfirmationProps> = ({
  customerName,
  orderNumber,
  orderDate,
  orderItems,
  subtotal,
  shipping,
  total,
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
      <Preview>{t.previewText} {orderNumber}</Preview>
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
            <Heading style={heading}>{t.orderConfirmation}</Heading>
            <Text style={paragraph}>
              {t.greeting} {customerName},
            </Text>
            <Text style={paragraph}>
              {t.thankYou}
            </Text>
            
            <Section style={orderDetails}>
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
              <Heading as="h2" style={subheading}>{t.shippingInformation}</Heading>
              <Text style={paragraph}>{address}</Text>
            </Section>

            <Section style={customerInfoSection}>
              <Heading as="h2" style={subheading}>{t.paymentMethod}</Heading>
              <Text style={paragraph}>{paymentMethod}</Text>
            </Section>

            <Text style={paragraph}>
              {t.questions}
            </Text>

            <Text style={paragraph}>
              {t.regards}<br />
              {t.teamName}
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              {t.copyright}
            </Text>
            <Text style={footerText}>
              {t.contactUs} <Link href="mailto:support@flowershop.com" style={link}>support@flowershop.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmation;

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

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4043',
};

const orderDetails = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f0f9ff', // Light blue background
  borderRadius: '4px',
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

const footer = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#747474',
  margin: '4px 0',
};

const link = {
  color: '#ec4899',
  textDecoration: 'underline',
};
