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
}) => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  return (
    <Html>
      <Head />
      <Preview>Your flower shop order confirmation {orderNumber}</Preview>
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
            <Heading style={heading}>Order Confirmation</Heading>
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            <Text style={paragraph}>
              Thank you for your order! We've received your purchase and are preparing your beautiful flowers with care.
            </Text>
            <Text style={paragraph}>
              <strong>Order Number:</strong> {orderNumber}<br />
              <strong>Order Date:</strong> {orderDate}
            </Text>

            <Section style={orderSummary}>
              <Heading as="h2" style={subheading}>Order Summary</Heading>

              {orderItems.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={itemDetails}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemMeta}>Quantity: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text>₴{(item.price * item.quantity).toFixed(2)}</Text>
                  </Column>
                </Row>
              ))}

              <Hr style={divider} />

              <Row style={subtotalRow}>
                <Column><Text style={subtotalLabel}>Subtotal</Text></Column>
                <Column style={subtotalValue}><Text>₴{subtotal.toFixed(2)}</Text></Column>
              </Row>

              <Row style={subtotalRow}>
                <Column><Text style={subtotalLabel}>Shipping</Text></Column>
                <Column style={subtotalValue}><Text>₴{shipping.toFixed(2)}</Text></Column>
              </Row>

              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Total</Text></Column>
                <Column style={totalValue}><Text>₴{total.toFixed(2)}</Text></Column>
              </Row>
            </Section>

            <Section style={shippingInfo}>
              <Heading as="h2" style={subheading}>Shipping Information</Heading>
              <Text style={paragraph}>{address}</Text>
            </Section>

            <Section style={paymentInfo}>
              <Heading as="h2" style={subheading}>Payment Method</Heading>
              <Text style={paragraph}>{paymentMethod}</Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions about your order, please contact our customer service.
            </Text>

            <Text style={paragraph}>
              Best regards,<br />
              The Flower Shop Team
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Flower Shop, All Rights Reserved
            </Text>
            <Text style={footerText}>
              If you have questions, contact us at <Link href="mailto:support@flowershop.com" style={link}>support@flowershop.com</Link>
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
  backgroundColor: '#ffffff',
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
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
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

const shippingInfo = {
  margin: '20px 0',
};

const paymentInfo = {
  margin: '20px 0',
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
