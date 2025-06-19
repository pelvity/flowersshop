// import { Suspense } from 'react';
// import TranslationsManager from '@/components/admin/translations/translations-manager';
// import { getTranslationEntitiesForAdmin } from '@/lib/i18n/admin-translations';
// import { Locale } from '../../../../../config/i18n';

// interface TranslationsPageProps {
//   params: {
//     locale: Locale;
//   };
//   searchParams?: {
//     type?: string;
//     locale?: string;
//   };
// }

// export default async function TranslationsPage({
//   params,
//   searchParams,
// }: TranslationsPageProps) {
//   const entityType = searchParams?.type || 'categories';
//   const targetLocale = searchParams?.locale || params.locale;
  
//   const { entities } = await getTranslationEntitiesForAdmin(entityType as any);
  
//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-8">Translations Manager</h1>
      
//       <Suspense fallback={<div>Loading translations...</div>}>
//         <TranslationsManager 
//           entities={entities}
//           entityType={entityType as any}
//           currentLocale={targetLocale as Locale}
//           adminLocale={params.locale}
//         />
//       </Suspense>
//     </div>
//   );
// } 