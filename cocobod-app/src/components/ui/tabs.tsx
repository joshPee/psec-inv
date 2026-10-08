'use client';

import * as React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({ value: '', onValueChange: () => {} });

const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className = '' }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  const { value: selectedValue } = React.useContext(TabsContext);

  if (selectedValue !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
