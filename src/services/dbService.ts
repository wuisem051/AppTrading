import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { PriceZoneAlert, VolatilityAlertEvent } from '../types/trading';

const COLLECTION_ZONES = 'trading_zones';
const COLLECTION_ALERT_LOGS = 'alert_history';

/**
 * Suscribe a las zonas de precio guardadas en Firestore en tiempo real.
 * Si Firebase falla (por ejemplo offline o reglas cerradas), ejecuta el fallback de error.
 */
export function subscribeToPriceZones(
  onUpdate: (zones: PriceZoneAlert[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, COLLECTION_ZONES), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const zones: PriceZoneAlert[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          zones.push({
            id: docSnap.id,
            price: Number(data.price),
            label: data.label || '',
            type: data.type || 'resistance',
            active: data.active ?? true,
            createdAt: data.createdAt || Date.now(),
            triggeredAt: data.triggeredAt || undefined
          });
        });
        onUpdate(zones);
      },
      (error) => {
        console.warn('Firestore subscription fallback (offline or permissions):', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to start Firestore snapshot:', err);
    return () => {};
  }
}

/**
 * Guarda o crea una nueva zona en Firestore.
 */
export async function savePriceZoneToDb(zone: PriceZoneAlert): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_ZONES, zone.id);
    await setDoc(docRef, {
      id: zone.id,
      price: zone.price,
      label: zone.label,
      type: zone.type,
      active: zone.active,
      createdAt: zone.createdAt,
      triggeredAt: zone.triggeredAt || null,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Could not save zone to Firestore (will remain local):', e);
  }
}

/**
 * Alterna el estado activo de una zona en Firestore.
 */
export async function togglePriceZoneInDb(id: string, active: boolean, triggeredAt?: number): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_ZONES, id);
    await updateDoc(docRef, {
      active,
      ...(triggeredAt ? { triggeredAt } : {}),
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Could not update zone in Firestore:', e);
  }
}

/**
 * Elimina una zona de Firestore.
 */
export async function deletePriceZoneFromDb(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_ZONES, id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Could not delete zone from Firestore:', e);
  }
}

/**
 * Guarda en la base de datos el historial de una alerta disparada (Volatilidad o Zona).
 */
export async function logAlertHistory(event: VolatilityAlertEvent | { type: string; zoneLabel: string; price: number; timestamp: number }): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTION_ALERT_LOGS), {
      ...event,
      savedAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Could not log alert event to Firestore:', e);
  }
}
