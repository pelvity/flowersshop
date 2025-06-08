# Flower Paradise Shop

A modern e-commerce application for a flower shop built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📱 Responsive design for all devices
- 🌐 Multilingual support (English and Ukrainian)
- 🔍 Product catalog with search, filtering, and sorting
- 🌸 Custom bouquet builder
- 🛒 Shopping cart with localStorage persistence
- 💳 Checkout process

## Technical Details

### Repository Pattern

The application uses a repository pattern to abstract data access:

- Data models are defined in `src/lib/repositories/types.ts`
- Static data is stored in `src/lib/repositories/data.ts`
- Repository implementations in `src/lib/repositories/index.ts`
- Cart repository with localStorage in `src/lib/repositories/cart.ts`

### State Management

- React Context API for global state management
- Shopping cart context in `src/context/cart-context.tsx`
- Language context in `src/context/language-context.tsx`

### UI Components

- Custom UI components in `src/components/ui`
- Cart components in `src/components/cart`
- Page-specific components in `src/components/client`

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Future Improvements

- Integration with a backend API
- User authentication
- Order history
- Admin panel for product management
- Payment gateway integration

## Email Configuration

The contact form uses Gmail and Nodemailer to send emails. To set this up:

1. Create or use an existing Gmail account
2. Enable 2-Step Verification in your Google Account security settings
3. Generate an App Password:
   - Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app and "Other" as the device (name it "Nodemailer")
   - Click "Generate"
   - Copy the 16-character password
4. Create a `.env.local` file in the project root with:
   ```
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   ```

## Technology Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Nodemailer

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
