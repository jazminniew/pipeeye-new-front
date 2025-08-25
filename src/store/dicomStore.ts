import { create } from 'zustand';

type Preview = { name: string; url: string };

interface DicomStore {
  previews: Preview[];
  setPreviews: (p: Preview[]) => void;

  taskId: string;
  setTaskId: (id: string) => void;

  formInfo: { cliente: string; proyecto: string; fecha: string };
  setFormInfo: (info: DicomStore['formInfo']) => void;
}

export const useDicomStore = create<DicomStore>((set) => ({
  previews: [],
  setPreviews: (p) => set({ previews: p }),

  taskId: '',
  setTaskId: (id) => set({ taskId: id }),

  formInfo: { cliente: '', proyecto: '', fecha: '' },
  setFormInfo: (info) => set({ formInfo: info }),
}));
