// lib/SearchContext.jsx

"use client";
import React, { createContext, useState, useContext } from "react";

// 1. Crear el Contexto
export const SearchContext = createContext();

// 2. Crear el Proveedor (Provider)
export const SearchProvider = ({ children }) => {
  // Estado que guardará el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useSearch = () => {
  return useContext(SearchContext);
};
