import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareIds, setCompareIds] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('staysmart_compare_ids');
    if (saved) {
      try {
        setCompareIds(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const addToCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 PGs at a time.');
        return prev;
      }
      const updated = [...prev, id];
      localStorage.setItem('staysmart_compare_ids', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCompare = (id) => {
    setCompareIds((prev) => {
      const updated = prev.filter((item) => item !== id);
      localStorage.setItem('staysmart_compare_ids', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareIds([]);
    localStorage.removeItem('staysmart_compare_ids');
  };

  const isComparing = (id) => compareIds.includes(id);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
