import { NextResponse, type NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

// Create a transport for nodemailer using Gmail
const transport = nodemailer.createTransport({
  service: 'gmail',
  /*
    Using the 'gmail' service preset automatically sets:
    host: "smtp.gmail.com",
    port: 465,
    secure: true
  */
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

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

    // Configure mail options
    const mailOptions: Mail.Options = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: `Flower Paradise Contact: ${name} (${email})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #f3f3f3; border-radius: 5px;">
          <h2 style="color: #e91e63;">New Contact Message from Flower Paradise</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
        </div>
      `
    };

    // Send the email
    await new Promise<string>((resolve, reject) => {
      transport.sendMail(mailOptions, function (err) {
        if (!err) {
          resolve('Email sent');
        } else {
          reject(err.message);
        }
      });
    });

    // Return success response
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 