import Contact from '@/components/contact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Flower Paradise',
  description: 'Get in touch with our team for any questions, concerns, or special orders.'
};

export default function ContactPage() {
  return <Contact />;
} 