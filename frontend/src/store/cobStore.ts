import { create } from "zustand";
import type { CobStatus } from "@/types";

interface CobState {
  cobStatus: CobStatus | null;
  setCobStatus: (status: CobStatus) => void;
}

export const useCobStore = create<CobState>((set) => ({
  cobStatus: null,
  setCobStatus: (status) => set({ cobStatus: status }),
}));