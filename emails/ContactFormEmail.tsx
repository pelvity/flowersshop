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

type ContactFormEmailProps = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  contactId: string;
  contactDate: string;
  locale?: string;
};

// Default translations
const translations = {
  en: {
    preview: 'New contact form submission from {name}',
    heading: 'New Contact Form Submission',
    introText: 'You have received a new message from your website\'s contact form.',
    contactDetails: 'Contact Details',
    nameLabel: 'Name:',
    emailLabel: 'Email:',
    phoneLabel: 'Phone:',
    dateLabel: 'Date:',
    referenceLabel: 'Reference ID:',
    messageHeading: 'Message',
    responseInstructions: 'To respond to this inquiry, simply reply to this email.',
    copyright: '© 2025 Flower Shop, All Rights Reserved',
    automatedMessage: 'This is an automated message from your website\'s contact form.'
  },
  pl: {
    preview: 'Nowe zgłoszenie z formularza kontaktowego od {name}',
    heading: 'Nowe zgłoszenie z formularza kontaktowego',
    introText: 'Otrzymałeś nową wiadomość z formularza kontaktowego na swojej stronie.',
    contactDetails: 'Szczegóły kontaktu',
    nameLabel: 'Imię:',
    emailLabel: 'Email:',
    phoneLabel: 'Telefon:',
    dateLabel: 'Data:',
    referenceLabel: 'Numer referencyjny:',
    messageHeading: 'Wiadomość',
    responseInstructions: 'Aby odpowiedzieć na to zapytanie, po prostu odpowiedz na tego emaila.',
    copyright: '© 2025 Kwiaciarnia, Wszelkie prawa zastrzeżone',
    automatedMessage: 'To jest automatyczna wiadomość z formularza kontaktowego na Twojej stronie.'
  }
};

export const ContactFormEmail: FC<ContactFormEmailProps> = ({
  name,
  email,
  phone,
  message,
  contactId,
  contactDate,
  locale = 'pl', // Default to Polish
}) => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // Use translations based on locale, defaulting to Polish if not specified
  const t = translations[locale as keyof typeof translations] || translations.pl;
  
  // Function to replace placeholders in translation strings
  const formatMessage = (message: string, replacements: Record<string, string>) => {
    return Object.entries(replacements).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, value),
      message
    );
  };

  return (
    <Html>
      <Head />
      <Preview>{formatMessage(t.preview, { name })}</Preview>
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
            <Heading style={heading}>{t.heading}</Heading>
            <Text style={paragraph}>
              {t.introText}
            </Text>
            
            <Section style={contactDetailsSection}>
              <Heading as="h2" style={subheading}>{t.contactDetails}</Heading>
              
              <Row style={detailRow}>
                <Column style={labelColumn}><Text style={label}>{t.nameLabel}</Text></Column>
                <Column><Text style={value}>{name}</Text></Column>
              </Row>
              
              <Row style={detailRow}>
                <Column style={labelColumn}><Text style={label}>{t.emailLabel}</Text></Column>
                <Column><Text style={value}>{email}</Text></Column>
              </Row>
              
              {phone && (
                <Row style={detailRow}>
                  <Column style={labelColumn}><Text style={label}>{t.phoneLabel}</Text></Column>
                  <Column><Text style={value}>{phone}</Text></Column>
                </Row>
              )}
              
              <Row style={detailRow}>
                <Column style={labelColumn}><Text style={label}>{t.dateLabel}</Text></Column>
                <Column><Text style={value}>{contactDate}</Text></Column>
              </Row>
              
              <Row style={detailRow}>
                <Column style={labelColumn}><Text style={label}>{t.referenceLabel}</Text></Column>
                <Column><Text style={value}>{contactId}</Text></Column>
              </Row>
            </Section>
            
            <Section style={messageSection}>
              <Heading as="h2" style={subheading}>{t.messageHeading}</Heading>
              <Text style={messageText}>{message}</Text>
            </Section>
            
            <Text style={paragraph}>
              {t.responseInstructions}
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              {t.copyright}
            </Text>
            <Text style={footerText}>
              {t.automatedMessage}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormEmail;

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

const contactDetailsSection = {
  padding: '15px',
  backgroundColor: '#fff8f8', // Light pink background
  borderRadius: '4px',
  margin: '20px 0',
};

const messageSection = {
  padding: '15px',
  backgroundColor: '#f0f9ff', // Light blue background
  borderRadius: '4px',
  margin: '20px 0',
};

const detailRow = {
  padding: '8px 0',
};

const labelColumn = {
  width: '30%',
};

const label = {
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  padding: '0',
  color: '#484848',
};

const value = {
  fontSize: '14px',
  margin: '0',
  padding: '0',
};

const messageText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#3c4043',
  margin: '0',
  padding: '0',
  whiteSpace: 'pre-wrap',
};

const subheading = {
  fontSize: '18px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '500',
  color: '#484848',
  margin: '0 0 10px',
};

const divider = {
  borderTop: '1px solid #e6e6e6',
  margin: '20px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px',
};

const footerText = {
  fontSize: '12px',
  color: '#747474',
  margin: '8px 0',
}; 