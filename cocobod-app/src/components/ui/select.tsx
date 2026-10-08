'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ value: '', onValueChange: () => {}, open: false, setOpen: () => {} });

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => {
  const { open, setOpen } = React.useContext(SelectContext);
  
  return (
    <div 
      onClick={() => setOpen(!open)}
      className={cn(
        'relative flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  return (
    <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>
      {value || placeholder}
    </span>
  );
};

const SelectContent: React.FC<SelectContentProps> = ({ children, className = '' }) => {
  const { open, setOpen } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className={cn(
      'absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg mt-1',
      className
    )}>
      {children}
    </div>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children, className = '' }) => {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext);
  
  return (
    <div
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-700',
        selectedValue === value ? 'bg-slate-100 dark:bg-slate-700 font-medium' : '',
        className
      )}
    >
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
