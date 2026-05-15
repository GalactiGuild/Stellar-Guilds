import React, { useState } from 'react';

// Multi-Currency Selection Component for Bounties
// Addresses issue #215

interface Currency {
  code: string;
  name: string;
  symbol: string;
  icon?: string;
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'XLM', name: 'Stellar Lumens', symbol: 'XLM' },
  { code: 'USDC', name: 'USD Coin', symbol: 'USDC' },
  { code: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
  { code: 'ETH', name: 'Ethereum', symbol: 'ETH' },
  { code: 'EURC', name: 'Euro Coin', symbol: 'EURC' },
];

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = SUPPORTED_CURRENCIES.find(c => c.code === value);

  return (
    <div className="currency-select">
      <button onClick={() => setOpen(!open)} className="select-trigger">
        {selected ? selected.code + ' - ' + selected.name : 'Select currency'}
      </button>
      {open && (
        <ul className="select-dropdown">
          {SUPPORTED_CURRENCIES.map(c => (
            <li key={c.code} onClick={() => { onChange(c.code); setOpen(false); }}>
              <strong>{c.code}</strong> <span>{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurrencySelect;
