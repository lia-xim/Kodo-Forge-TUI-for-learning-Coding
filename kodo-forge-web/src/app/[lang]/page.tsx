import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from './dictionaries';
import HomePage from './HomePage';

export default async function Page(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <HomePage dict={dict} lang={lang} />;
}
