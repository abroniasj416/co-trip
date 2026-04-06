import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Place, PlaceStatus } from '../types/place';

interface PlaceContextValue {
  places: Place[];
  selectedPlaceId: number | null;
  setPlaces: (places: Place[]) => void;
  addPlace: (place: Place) => void;
  updatePlaceStatus: (placeId: number, status: PlaceStatus) => void;
  updatePlaceMemo: (placeId: number, memo: string) => void;
  updatePlaceOrder: (placeId: number, order: number) => void;
  removePlace: (placeId: number) => void;
  selectPlace: (placeId: number | null) => void;
  confirmedPlaces: Place[];
}

const PlaceContext = createContext<PlaceContextValue | null>(null);

export function PlaceProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const addPlace = useCallback((place: Place) => {
    setPlaces((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      return [...prev, place].sort((a, b) => a.placeOrder - b.placeOrder);
    });
  }, []);

  const updatePlaceStatus = useCallback((placeId: number, status: PlaceStatus) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, status } : p))
    );
  }, []);

  const updatePlaceMemo = useCallback((placeId: number, memo: string) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, memo } : p))
    );
  }, []);

  const updatePlaceOrder = useCallback((placeId: number, order: number) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, placeOrder: order } : p))
        .sort((a, b) => a.placeOrder - b.placeOrder)
    );
  }, []);

  const removePlace = useCallback((placeId: number) => {
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    setSelectedPlaceId((prev) => (prev === placeId ? null : prev));
  }, []);

  const selectPlace = useCallback((placeId: number | null) => {
    setSelectedPlaceId(placeId);
  }, []);

  const confirmedPlaces = places
    .filter((p) => p.status === 'CONFIRMED')
    .sort((a, b) => a.placeOrder - b.placeOrder);

  return (
    <PlaceContext.Provider value={{
      places, selectedPlaceId, setPlaces,
      addPlace, updatePlaceStatus, updatePlaceMemo,
      updatePlaceOrder, removePlace, selectPlace,
      confirmedPlaces,
    }}>
      {children}
    </PlaceContext.Provider>
  );
}

export function usePlaces(): PlaceContextValue {
  const ctx = useContext(PlaceContext);
  if (!ctx) throw new Error('usePlaces must be used within PlaceProvider');
  return ctx;
}
