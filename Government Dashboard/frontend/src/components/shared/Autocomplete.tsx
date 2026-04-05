"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface AutocompleteProps {
  items: { id: string; label: string; sublabel?: string }[];
  placeholder?: string;
  onSelect: (id: string) => void;
  defaultValue?: string;
  className?: string;
}

export default function Autocomplete({ items, placeholder, onSelect, defaultValue = '', className = '' }: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = items.find(i => i.id === defaultValue);
    if (item) setQuery(item.label);
  }, [defaultValue, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = query === '' 
    ? items.slice(0, 5) 
    : items.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) || 
        (item.sublabel && item.sublabel.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full text-xs font-bold p-2 pl-8 bg-white border border-slate-200 rounded focus:border-slate-400 outline-none transition-all"
          placeholder={placeholder || "Search area..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-[1000] w-full mt-1 bg-white border border-slate-200 rounded shadow-xl max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
              onClick={() => {
                setQuery(item.label);
                onSelect(item.id);
                setIsOpen(false);
              }}
            >
              <p className="text-[11px] font-black text-slate-900">{item.label}</p>
              {item.sublabel && <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{item.sublabel}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
