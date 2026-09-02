'use client';
import type { GeoPoint } from './juliaca';

export type PaymentMethod = 'efectivo' | 'yape';
export type DispatchStatus = 'registrado' | 'ofertando' | 'aceptado' | 'recogiendo' | 'esperando' | 'en-viaje' | 'finalizado' | 'cancelado';
export type DispatchOffer = { unitId: string; expiresAt: number; attempt: number };
export type DriverResponse = { unitId: string; response: 'aceptada' | 'rechazada' | 'vencida'; respondedAt: number };
export type DispatchJob = {
  id: string; passengerName: string; passengerPhone: string;
  pickupAddress: string; destinationAddress: string;
  pickup: GeoPoint; destination: GeoPoint; fare: number;
  paymentMethod: PaymentMethod; status: DispatchStatus;
  candidateUnitIds: string[]; candidateIndex: number;
  offer: DispatchOffer | null; assignedUnitId: string | null;
  responses: DriverResponse[]; createdAt: number;
};

const STORAGE_KEY = 'real-san-roman:dispatch:v1';
const CHANNEL = 'real-san-roman:dispatch';
export const OFFER_SECONDS = 22;
const available = () => typeof window !== 'undefined';

export function readDispatchJobs(): DispatchJob[] {
  if (!available()) return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as DispatchJob[]; } catch { return []; }
}

function publish(jobs: DispatchJob[]) {
  if (!available()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage(jobs); channel.close();
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: jobs }));
}

function updateJob(id: string, updater: (job: DispatchJob) => DispatchJob) {
  const jobs = readDispatchJobs().map((job) => job.id === id ? updater(job) : job);
  publish(jobs);
  return jobs.find((job) => job.id === id) ?? null;
}

export function createDispatchJob(input: Omit<DispatchJob, 'status' | 'candidateIndex' | 'offer' | 'assignedUnitId' | 'responses' | 'createdAt'>) {
  const job: DispatchJob = { ...input, status: 'registrado', candidateIndex: 0, offer: null, assignedUnitId: null, responses: [], createdAt: Date.now() };
  publish([job, ...readDispatchJobs().filter((item) => item.id !== job.id)]);
  return job;
}

export function startDispatchCascade(id: string, preferredUnitId?: string) {
  return updateJob(id, (job) => {
    const candidates = preferredUnitId ? [preferredUnitId, ...job.candidateUnitIds.filter((unitId) => unitId !== preferredUnitId)] : job.candidateUnitIds;
    if (!candidates.length) return { ...job, status: 'registrado', candidateUnitIds: candidates };
    return { ...job, status: 'ofertando', candidateUnitIds: candidates, candidateIndex: 0, offer: { unitId: candidates[0], expiresAt: Date.now() + OFFER_SECONDS * 1000, attempt: 1 } };
  });
}

export function advanceDispatchCandidate(id: string, reason: 'rechazada' | 'vencida') {
  return updateJob(id, (job) => {
    if (!job.offer || job.status !== 'ofertando') return job;
    const nextIndex = job.candidateIndex + 1;
    const responses = [...job.responses, { unitId: job.offer.unitId, response: reason, respondedAt: Date.now() }];
    const nextUnitId = job.candidateUnitIds[nextIndex];
    return nextUnitId
      ? { ...job, candidateIndex: nextIndex, responses, offer: { unitId: nextUnitId, expiresAt: Date.now() + OFFER_SECONDS * 1000, attempt: nextIndex + 1 } }
      : { ...job, status: 'registrado', responses, offer: null };
  });
}

export function acceptDispatchOffer(id: string, unitId: string) {
  return updateJob(id, (job) => job.status === 'ofertando' && job.offer?.unitId === unitId ? { ...job, status: 'aceptado', assignedUnitId: unitId, responses: [...job.responses, { unitId, response: 'aceptada', respondedAt: Date.now() }], offer: null } : job);
}
export function rejectDispatchOffer(id: string, unitId: string) {
  const job = readDispatchJobs().find((item) => item.id === id);
  return job?.offer?.unitId === unitId ? advanceDispatchCandidate(id, 'rechazada') : null;
}
export function updateDispatchStatus(id: string, status: DispatchStatus) { return updateJob(id, (job) => ({ ...job, status })); }

export function subscribeDispatchJobs(listener: (jobs: DispatchJob[]) => void) {
  if (!available()) return () => undefined;
  const channel = new BroadcastChannel(CHANNEL);
  const onMessage = (event: MessageEvent<DispatchJob[]>) => listener(event.data);
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) listener(readDispatchJobs()); };
  const onCustom = (event: Event) => listener((event as CustomEvent<DispatchJob[]>).detail);
  channel.addEventListener('message', onMessage); window.addEventListener('storage', onStorage); window.addEventListener(CHANNEL, onCustom); listener(readDispatchJobs());
  return () => { channel.removeEventListener('message', onMessage); channel.close(); window.removeEventListener('storage', onStorage); window.removeEventListener(CHANNEL, onCustom); };
}
