// src/pages/ImageUpload.tsx
import React, { useEffect, useState, useRef } from 'react';
import { X, Building2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

import { useDicomStore } from '../store/dicomStore';
import Header from '../components/Navbar';
import styles from '../styles/ImageUpload.module.css';
import { apiFetch } from '../lib/api';
import ProyectoSelector, { type ModoProyecto } from '../components/RadioBtn';
import '../styles/Globals.css';

// ===== Cornerstone wiring
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.webWorkerManager.initialize({
  webWorkerPath: '/cornerstone/cornerstoneWADOImageLoaderWebWorker.js',
  taskConfiguration: {
    decodeTask: {
      codecsPath: '/cornerstone/cornerstoneWADOImageLoaderCodecs.js',
    },
  },
});

// ====== FAKE DATA (UI)
const EMPRESAS_FAKE = ['ENOD', 'Empresa2', 'Empresa3', 'Empresa4'] as const;
const PROYECTOS_FAKE: Record<(typeof EMPRESAS_FAKE)[number], string[]> = {
  ENOD: ['Oleoducto Sur', 'Inspección Q3', 'Reparación 12B'],
  Empresa2: ['Batería La Plata', 'Yacimiento X-17'],
  Empresa3: ['Gasoducto Norte', 'Relevamiento Anual'],
  Empresa4: ['Planta Dock Sud', 'Parada de Planta'],
};
const PROYECTO_ID_POST = 2;

type Preview = { name: string; url: string; file?: File };
type Errores = { files?: string; empresa?: string; proyecto?: string };

const ImageUpload: React.FC = () => {
  // izquierda
  const [files, setFiles] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errores, setErrores] = useState<Errores>({});

  // drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  // derecha (selector)
  const [modo, setModo] = useState<ModoProyecto>('existente');
  const [empresaSel, setEmpresaSel] = useState<string>('');
  const [proyectoSel, setProyectoSel] = useState<string>('');
  const [empresaNueva, setEmpresaNueva] = useState('');
  const [proyectoNuevo, setProyectoNuevo] = useState('');

  const navigate = useNavigate();

  // store
  const setFormInfo = useDicomStore((s) => s.setFormInfo);
  const setPreviews = useDicomStore((s) => s.setPreviews);
  const setTaskId = useDicomStore((s) => s.setTaskId);
  const previews = useDicomStore((s) => s.previews) as Preview[] | undefined;

  const inputRef = useRef<HTMLInputElement>(null);

  // util
  const capitalize = (v: string) => (v ? v[0].toUpperCase() + v.slice(1).toLowerCase() : '');

  // reset proyecto cuando cambia empresa
  useEffect(() => {
    setProyectoSel('');
  }, [empresaSel]);

  // evitar abrir archivos fuera del dropzone
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  // ======== Utils de filtrado DICOM
  function pickDicoms(list: FileList | File[] | null | undefined): File[] {
    if (!list) return [];
    const arr: File[] = Array.isArray(list) ? list : Array.from(list as FileList);
    return arr.filter((f: File) => {
      const name = f.name?.toLowerCase?.() ?? '';
      const type = f.type ?? '';
      return (
        name.endsWith('.dcm') ||
        type === 'application/dicom' ||
        (type === '' && name.endsWith('.dcm'))
      );
    });
  }

  const filesRef = useRef<File[]>([]);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // ======== Generación de previews + guardado en store
  async function ingestFiles(newFiles: File[]) {
    const keyOf = (f: File) => `${f.name}::${f.size}::${f.lastModified}`;
    const existingKeys = new Set(filesRef.current.map(keyOf));
    const newOnes = newFiles.filter((f) => !existingKeys.has(keyOf(f)));

    setFiles([...filesRef.current, ...newOnes]);

    const newPreviews: Preview[] = [];
    for (const file of newOnes) {
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      try {
        const image: any = await cornerstone.loadAndCacheImage(imageId);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const pixelData = image.getPixelData() as Uint16Array | Uint8Array;
        const imageData = ctx.createImageData(image.width, image.height);

        const slope = image.slope ?? 1;
        const intercept = image.intercept ?? 0;
        const wc = Array.isArray(image.windowCenter)
          ? image.windowCenter[0]
          : image.windowCenter ?? 128;
        const ww = Array.isArray(image.windowWidth)
          ? image.windowWidth[0]
          : image.windowWidth ?? 256;

        for (let i = 0; i < pixelData.length; i++) {
          const modality = Number(pixelData[i]) * slope + intercept;
          const grayscale = Math.min(
            255,
            Math.max(0, ((modality - (wc - 0.5)) / (ww - 1) + 0.5) * 255)
          );
          imageData.data[i * 4 + 0] = grayscale;
          imageData.data[i * 4 + 1] = grayscale;
          imageData.data[i * 4 + 2] = grayscale;
          imageData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        const url = canvas.toDataURL('image/png');
        newPreviews.push({ name: file.name, url, file }); // agrega el File

      } catch {
        // ignorar errores individuales
      }
    }

    const curr = (useDicomStore.getState().previews as Preview[] | undefined) ?? [];
    const next = [...curr, ...newPreviews];
    setPreviews(next);
  }

  // ======== Inputs
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked: File[] = pickDicoms(e.target.files);
    e.currentTarget.value = ''; // reset del input antes del await
    if (!picked.length) {
      setErrores({ files: 'Elegí archivos .dcm' });
    } else {
      setErrores((prev) => ({ ...prev, files: undefined }));
      await ingestFiles(picked);
    }
  };

  // ======== Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);

    const fromItems: File[] = [];
    if (e.dataTransfer.items && e.dataTransfer.items.length) {
      for (const it of Array.from(e.dataTransfer.items)) {
        if (it.kind === 'file') {
          const f = it.getAsFile();
          if (f) fromItems.push(f);
        }
      }
    }
    const fallback: File[] = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    const all: File[] = fromItems.length ? fromItems : fallback;

    const dicoms: File[] = pickDicoms(all);
    if (!dicoms.length) {
      setErrores({ files: 'Arrastrá únicamente archivos .dcm' });
      return;
    }
    setErrores((prev) => ({ ...prev, files: undefined }));
    await ingestFiles(dicoms);
  };

  // ======== Continuar
  const handleUploadAndNext = async () => {
    const nextErrors: Errores = {};
    if (files.length === 0) nextErrors.files = 'Subí al menos una imagen .dcm';

    if (modo === 'existente') {
      if (!empresaSel) nextErrors.empresa = 'Seleccioná una empresa';
      if (!proyectoSel) nextErrors.proyecto = 'Seleccioná un proyecto';
    } else {
      if (!empresaNueva.trim()) nextErrors.empresa = 'Ingresá el nombre de la empresa';
      if (!proyectoNuevo.trim()) nextErrors.proyecto = 'Ingresá el nombre del proyecto';
    }

    setErrores(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const clienteNombre = modo === 'existente' ? empresaSel : empresaNueva.trim();
    const proyectoNombre = modo === 'existente' ? proyectoSel : proyectoNuevo.trim();

    setSubiendo(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const data = await apiFetch<{ task_id: string }>(
        `/upload-imgs-in-background/?proyecto_id=${PROYECTO_ID_POST}`,
        { method: 'POST', body: formData }
      );

      if (data?.task_id) {
        setTaskId(String(data.task_id));
        setFormInfo({
          cliente: clienteNombre,
          proyecto: proyectoNombre,
          fecha: new Date().toISOString(),
        });
        navigate('/analyzeImages');
      } else {
        setErrores({ files: 'Error: no se recibió task_id del backend.' });
      }
    } catch (error: any) {
      if (error?.message === 'UNAUTHORIZED') {
        setErrores({ files: 'Sesión expirada. Iniciá sesión de nuevo.' });
        navigate('/');
      } else {
        setErrores({ files: 'Error al subir imágenes al backend.' });
      }
    } finally {
      setSubiendo(false);
    }
  };

  // ======== Remover/limpiar
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    const nextPreviews: Preview[] = (previews ?? []).filter((_, i) => i !== index);
    setPreviews(nextPreviews);
  };

  const handleClearAll = () => {
    setFiles([]);
    setPreviews([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  // ======== IDs (accesibilidad)
  const idEmpresaExist = 'empresa-existente';
  const idProyectoExist = 'proyecto-existente';
  const idEmpresaNueva = 'empresa-nueva';
  const idProyectoNuevo = 'proyecto-nuevo';

  return (
    <div className={`${styles.pageLock} ${styles.body}`}>
      <Header />
      <div className={styles.container}>
        {/* IZQUIERDA */}
        <div className={styles.leftSection}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>
              <strong>{isDragging ? 'Soltá para subir .dcm' : 'Arrastrá tus imágenes DICOM'}</strong>
            </p>
            <p className={styles.secondaryText}>o hacé clic para seleccionar archivos</p>

            <label htmlFor="fileInput" className={styles.customFileButton}>
              Seleccionar
            </label>
            <input
              id="fileInput"
              ref={inputRef}
              type="file"
              accept=".dcm,application/dicom"
              multiple
              onChange={handleFileChange}
              className={styles.hiddenInput}
            />

            <p className={styles.compatibleText}>Formatos permitidos: .dcm</p>
          </div>

          {files.length > 0 && (
            <div className={styles.previewContainer}>
              <div className={styles.leftScroll}>
                <div className={styles.previewHeader}>
                  <h3>Archivos seleccionados</h3>
                  <button type="button" className={styles.clearAllButton} onClick={handleClearAll}>
                    Limpiar
                  </button>
                </div>

                {errores.files && <p className={styles.errorText}>{errores.files}</p>}

                <div className={styles.fileList}>
                  {files.map((file, idx) => (
                    <div key={idx} className={styles.fileName}>
                      <span>{file.name}</span>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleRemoveFile(idx)}
                        aria-label={`Eliminar ${file.name}`}
                        title="Eliminar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DERECHA */}
        <div className={styles.rightSection}>
          <div className={styles.selector}>
            <ProyectoSelector value={modo} onChange={setModo} />
          </div>

          <h2>Completar la siguiente información:</h2>

          {modo === 'existente' ? (
            <>
              <div className={styles.fieldLabel}>
                <Building2 size={20} className={styles.ionIcon} />
                <label htmlFor={idEmpresaExist}>Empresa</label>
              </div>
              <select
                id={idEmpresaExist}
                className={styles.select}
                value={empresaSel}
                onChange={(e) => setEmpresaSel(e.target.value)}
              >
                <option value="">Nombre empresa</option>
                {EMPRESAS_FAKE.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <div className={styles.fieldLabel}>
                <FileText size={20} className={styles.ionIcon} />
                <label htmlFor={idProyectoExist}>Proyecto</label>
              </div>
              <select
                id={idProyectoExist}
                className={styles.select}
                value={proyectoSel}
                onChange={(e) => setProyectoSel(e.target.value)}
                disabled={!empresaSel}
              >
                <option value="">Nombre del proyecto</option>
                {(empresaSel ? PROYECTOS_FAKE[empresaSel as keyof typeof PROYECTOS_FAKE] : []).map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  )
                )}
              </select>
            </>
          ) : (
            <>
              <div className={styles.fieldLabel}>
                <Building2 size={20} className={styles.ionIcon} />
                <label htmlFor={idEmpresaNueva}>Empresa</label>
              </div>
              <input
                id={idEmpresaNueva}
                className={styles.input}
                placeholder="Nombre empresa"
                value={empresaNueva}
                onChange={(e) => setEmpresaNueva(capitalize(e.target.value))}
              />

              <div className={styles.fieldLabel}>
                <FileText size={20} className={styles.ionIcon} />
                <label htmlFor={idProyectoNuevo}>Proyecto</label>
              </div>
              <input
                id={idProyectoNuevo}
                className={styles.input}
                placeholder="Nombre del proyecto"
                value={proyectoNuevo}
                onChange={(e) => setProyectoNuevo(capitalize(e.target.value))}
              />
            </>
          )}

          <button className={styles.nextButton} onClick={handleUploadAndNext} disabled={subiendo}>
            {subiendo ? 'Subiendo…' : 'Siguiente'}
          </button>

          {(errores.files || errores.empresa || errores.proyecto) && (
            <div className={styles.errorBanner} role="alert">
              <span>Asegurate de completar todos los campos.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
