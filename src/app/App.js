import CardForm from '../features/card-generator/components/CardForm';
import { LocaleProvider, useLocale } from './LocaleContext';
import React from 'react';
import { Listbox } from '@headlessui/react';

const LocaleSelector = () => {
  const { locale, setLocale } = useLocale();

  const locales = [
    { value: 'pt', label: 'Português', flag: 'i-flagpack:pt' },
    { value: 'en', label: 'English', flag: 'i-flagpack:us' },
    // { value: 'es', label: 'Español', flag: 'i-flagpack:es' },
    // { value: 'fr', label: 'Français', flag: 'i-flagpack:fr' },
  ];

  const currentLocale = locales.find(l => l.value === locale) || locales[0];
  const flagMap = {
    'i-flagpack:pt': '🇧🇷',
    'i-flagpack:us': '🇺🇸',
    'i-flagpack:es': '🇪🇸',
    'i-flagpack:fr': '🇫🇷',
  };

  return (
    

    <div className="p-3 flex justify-end items-center gap-2">
      <Listbox value={locale} onChange={setLocale}>
        <div className="relative w-36 text-right">
          <Listbox.Button className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 inline-flex items-center text-left cursor-default rounded-md text-sm gap-x-2.5 px-3.5 py-2.5 shadow-sm bg-black text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-primary-500 pe-11 w-16 hover:bg-gray-800 transition-colors">
            <span className="text-3xl" aria-hidden="true">{flagMap[currentLocale.flag] || '🌐'}</span>
            <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-3.5 pr-1.5">
              <span className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 text-gray-500 h-5 w-5" aria-hidden="true"></span>
            </span>
          </Listbox.Button>
          <Listbox.Options className="z-20 left-0 top-full mt-1 w-36 focus:outline-none overflow-y-auto scroll-py-1 ring-1 ring-gray-700 rounded-md shadow-lg bg-black p-1 max-h-60">
            {locales.map((l) => (
              <Listbox.Option
                key={l.value}
                value={l.value}
                className="cursor-default select-none relative flex items-center justify-between gap-1 w-full overflow-hidden rounded-md px-1.5 py-1.5 text-sm text-white ui-active:bg-primary-600 ui-active:text-white ui-selected:bg-primary-500 ui-selected:text-white hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-3xl" aria-hidden="true">{flagMap[l.flag] || '🌐'}</span>
                  {l.label}
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

function App() {
  return (
    <LocaleProvider>
      <div className="min-h-screen bg-black">
        <LocaleSelector />
        <CardForm />
      </div>
    </LocaleProvider>
  );
}

export default App;