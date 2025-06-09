import { redirect } from 'next/navigation';
import { defaultLocale } from '../../config/i18n';
import Header from "@/components/header";
import Footer from "@/components/footer";
import HomeClient from "@/components/client/home-client";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
