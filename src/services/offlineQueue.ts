import Dexie, { Table } from "dexie";

export interface PendingPing {
  id?: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  recordedAt: string;
  routeId?: string;
}

export interface PendingAction {
  id?: number;
  kind: "ARRIVE" | "COMPLETE" | "FAIL";
  deliveryId: string;
  payload: any;
  photoBlob?: Blob;
  createdAt: string;
}

class OfflineDB extends Dexie {
  pings!: Table<PendingPing, number>;
  actions!: Table<PendingAction, number>;

  constructor() {
    super("rotacerta-offline");
    this.version(1).stores({
      pings: "++id, recordedAt",
      actions: "++id, kind, deliveryId, createdAt"
    });
  }
}

export const offlineDB = new OfflineDB();

import { api } from "./api";

export async function enqueuePing(ping: PendingPing) {
  await offlineDB.pings.add(ping);
}

export async function enqueueAction(action: PendingAction) {
  await offlineDB.actions.add(action);
}

export async function syncQueues() {
  if (!navigator.onLine) return { pings: 0, actions: 0 };

  // Sincroniza pings em lote
  const pings = await offlineDB.pings.toArray();
  let sentPings = 0;
  if (pings.length > 0) {
    try {
      await api.post("/locations/ping/batch", { pings });
      await offlineDB.pings.clear();
      sentPings = pings.length;
    } catch (e) {
      console.warn("[sync] falha ao sincronizar pings", e);
    }
  }

  // Sincroniza ações
  const actions = await offlineDB.actions.toArray();
  let sentActions = 0;
  for (const a of actions) {
    try {
      if (a.kind === "ARRIVE") {
        await api.post(`/deliveries/${a.deliveryId}/arrive`, a.payload);
      } else if (a.kind === "COMPLETE") {
        const form = new FormData();
        form.append("latitude", String(a.payload.latitude));
        form.append("longitude", String(a.payload.longitude));
        if (a.payload.notes) form.append("notes", a.payload.notes);
        if (a.photoBlob) form.append("photo", a.photoBlob, "proof.jpg");
        await api.post(`/deliveries/${a.deliveryId}/complete`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (a.kind === "FAIL") {
        await api.post(`/deliveries/${a.deliveryId}/fail`, a.payload);
      }
      await offlineDB.actions.delete(a.id!);
      sentActions++;
    } catch (e) {
      console.warn("[sync] falha ao sincronizar ação", a, e);
    }
  }

  return { pings: sentPings, actions: sentActions };
}

// auto-sync ao voltar online
window.addEventListener("online", () => {
  syncQueues().then((r) => {
    if (r.pings + r.actions > 0) console.log("[sync]", r);
  });
});
