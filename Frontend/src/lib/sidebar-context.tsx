"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  isSidebarExpanded: boolean
  setIsSidebarExpanded: (expanded: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  return (
    <SidebarContext.Provider value={{ isSidebarExpanded, setIsSidebarExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
} 