import React, { createContext, useContext, useState, ReactNode } from 'react';

interface COTDataItem {
  currency: string;
  commercialLong: number;
  commercialShort: number;
  nonCommercialLong: number;
  nonCommercialShort: number;
  reportDate: string;
  weeklyChange: number;
  type?: 'forex' | 'commodity';
}

interface COTDataContextType {
  cotData: COTDataItem[];
  setCOTData: (data: COTDataItem[]) => void;
  isDataLoading: boolean;
  setIsDataLoading: (loading: boolean) => void;
  lastUpdated: Date | null;
  setLastUpdated: (date: Date) => void;
}

const COTDataContext = createContext<COTDataContextType | undefined>(undefined);

export const useCOTData = () => {
  const context = useContext(COTDataContext);
  if (context === undefined) {
    throw new Error('useCOTData must be used within a COTDataProvider');
  }
  return context;
};

interface COTDataProviderProps {
  children: ReactNode;
}

export const COTDataProvider: React.FC<COTDataProviderProps> = ({ children }) => {
  const [cotData, setCOTData] = useState<COTDataItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const value = {
    cotData,
    setCOTData,
    isDataLoading,
    setIsDataLoading,
    lastUpdated,
    setLastUpdated,
  };

  return (
    <COTDataContext.Provider value={value}>
      {children}
    </COTDataContext.Provider>
  );
};