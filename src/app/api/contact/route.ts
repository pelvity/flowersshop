import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import ContactFormEmail from '../../../../emails/ContactFormEmail';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate the request data
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Generate contact ID and date.
    const contactId = `CONTACT-${Date.now().toString().slice(-6)}`;
    const contactDate = new Date().toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Send confirmation email to the person who submitted the form
    try {
      const customerEmailProps = {
        name,
        email,
        phone,
        message,
        contactId,
        contactDate,
        locale: 'pl'
      };
      
      const customerEmail = await resend.emails.send({
        from: 'info@lafleur-lublin.com',
        to: email,
        subject: `Dziękujemy za kontakt: #${contactId}`,
        react: React.createElement(ContactFormEmail, customerEmailProps)
      });

      if (customerEmail.error) {
        console.error('Error sending customer confirmation email:', customerEmail.error);
        // Continue to other notifications even if email fails
      }
    } catch (customerEmailError) {
      console.error('Exception sending customer confirmation email:', customerEmailError);
      // Continue to other notifications even if email fails
    }

    // Send notification to admin - using the exact same pattern as in order/route.ts
    try {
      const adminEmailProps = {
        name,
        email,
        phone,
        message,
        contactId,
        contactDate,
        locale: 'pl'
      };
      
      const adminEmail = await resend.emails.send({
        from: 'info@lafleur-lublin.com',
        to: process.env.ADMIN_EMAIL || 'admin@lafleur-lublin.com',
        subject: `New Contact Form Message: ${name}`,
        react: React.createElement(ContactFormEmail, adminEmailProps),
        replyTo: email,
      });

      if (adminEmail.error) {
        console.error('Error sending admin email:', adminEmail.error);
        // Don't return error here, continue execution
      }
    } catch (adminEmailError: any) {
      console.error('Exception sending admin email:', adminEmailError);
      // Don't return error here, continue execution
    }

    // Return success response even if email fails
    // This matches the behavior in the order API
    return NextResponse.json({ 
      success: true, 
      message: "Contact form submitted successfully",
      contactId
    });
    
  } catch (error: any) {
    console.error('Contact form submission failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process contact form' },
      { status: 500 }
    );
  }
} 