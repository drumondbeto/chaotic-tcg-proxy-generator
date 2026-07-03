import CardForm from './components/CardForm';
import { LocaleProvider, useLocale } from './LocaleContext';
import React from 'react';

const EmptyStatusCheckbox = ({ label, checked }) => {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={checked} readOnly className="w-4 h-4" />
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  );
};

const LocaleSelector = () => {
  const { locale, setLocale } = useLocale();
  return (
    <div className="p-3 flex justify-end items-center gap-2">
      <label className="text-sm text-gray-300">Language</label>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="bg-gray-800 text-white p-1 rounded"
      >
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
    </div>
  );
};

function App() {
  return (
    <LocaleProvider>
      <div className="min-h-screen bg-black">
        <EmptyStatusCheckbox label="No Stats" checked={false} />
        <LocaleSelector />
        <CardForm />
      </div>
    </LocaleProvider>
  );
}

export default App;