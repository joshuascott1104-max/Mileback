import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { demoVehicles, demoMileageClaims, demoExpenses, demoSettings, demoFavouriteJourneys } from '../data/demo'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [mileageClaims, setMileageClaims] = useLocalStorage('mileback_mileage', demoMileageClaims)
  const [expenses, setExpenses] = useLocalStorage('mileback_expenses', demoExpenses)
  const [vehicles, setVehicles] = useLocalStorage('mileback_vehicles', demoVehicles)
  const [settings, setSettings] = useLocalStorage('mileback_settings', demoSettings)
  const [favouriteJourneys, setFavouriteJourneys] = useLocalStorage('mileback_favourites', demoFavouriteJourneys)

  // --- Mileage ---
  const addMileageClaim = (claim) => {
    const newClaim = { ...claim, id: `m${Date.now()}` }
    setMileageClaims(prev => [newClaim, ...prev])
    return newClaim
  }
  const updateMileageClaim = (id, updates) => {
    setMileageClaims(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }
  const deleteMileageClaim = (id) => {
    setMileageClaims(prev => prev.filter(c => c.id !== id))
  }

  // --- Expenses ---
  const addExpense = (expense) => {
    const newExpense = { ...expense, id: `e${Date.now()}` }
    setExpenses(prev => [newExpense, ...prev])
    return newExpense
  }
  const updateExpense = (id, updates) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }
  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  // --- Vehicles ---
  const addVehicle = (vehicle) => {
    const newVehicle = { ...vehicle, id: `v${Date.now()}` }
    setVehicles(prev => [...prev, newVehicle])
  }
  const updateVehicle = (id, updates) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))
  }
  const deleteVehicle = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id))
  }
  const setDefaultVehicle = (id) => {
    setVehicles(prev => prev.map(v => ({ ...v, isDefault: v.id === id })))
    setSettings(prev => ({ ...prev, defaultVehicleId: id }))
  }

  // --- Favourites ---
  const addFavouriteJourney = (journey) => {
    const newJourney = { ...journey, id: `fj${Date.now()}` }
    setFavouriteJourneys(prev => [...prev, newJourney])
  }
  const deleteFavouriteJourney = (id) => {
    setFavouriteJourneys(prev => prev.filter(j => j.id !== id))
  }

  const restoreBackup = (data) => {
    if (data.mileageClaims) setMileageClaims(data.mileageClaims)
    if (data.expenses) setExpenses(data.expenses)
    if (data.vehicles) setVehicles(data.vehicles)
    if (data.settings) setSettings(data.settings)
    if (data.favouriteJourneys) setFavouriteJourneys(data.favouriteJourneys)
  }

  const value = {
    mileageClaims, addMileageClaim, updateMileageClaim, deleteMileageClaim,
    expenses, addExpense, updateExpense, deleteExpense,
    vehicles, addVehicle, updateVehicle, deleteVehicle, setDefaultVehicle,
    settings, setSettings,
    favouriteJourneys, addFavouriteJourney, deleteFavouriteJourney,
    restoreBackup,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
