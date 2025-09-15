import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import { useDicomStore } from '../store/dicomStore';
import Header from '../components/Navbar';
import styles from '../styles/ImageUpload.module.css';
import { apiFetch } from '../lib/api';
import ProyectoSelector, { type ModoProyecto } from '../components/RadioBtn';
import { Building2, FileText } from 'lucide-react';
import '../styles/Globals.css';

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

// ====== SOLO FAKE DATA PARA UI ======
const EMPRESAS_FAKE = ['ENOD', 'Empresa2', 'Empresa3', 'Empresa4'] as const;
const PROYECTOS_FAKE: Record<(typeof EMPRESAS_FAKE)[number], string[]> = {
  ENOD: ['Oleoducto Sur', 'Inspección Q3', 'Reparación 12B'],
  Empresa2: ['Batería La Plata', 'Yacimiento X-17'],
  Empresa3: ['Gasoducto Norte', 'Relevamiento Anual'],
  Empresa4: ['Planta Dock Sud', 'Parada de Planta'],
};
// ID fijo mientras todo es fake (cámbialo cuando uses el real)
const PROYECTO_ID_POST = 2;

type Preview = { name: string; url: string };
type Errores = { files?: string; empresa?: string; proyecto?: string };

const ImageUpload: React.FC = () => {
  // izquierda
  const [files, setFiles] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errores, setErrores] = useState<Errores>({});

  // drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  // derecha (común)
  const [modo, setModo] = useState<ModoProyecto>('existente');

  // existente
  const [empresaSel, setEmpresaSel] = useState<string>('');
  const [proyectoSel, setProyectoSel] = useState<string>('');

  // nuevo
  const [empresaNueva, setEmpresaNueva] = useState('');
  const [proyectoNuevo, setProyectoNuevo] = useState('');

  const navigate = useNavigate();
  const setFormInfo = useDicomStore((s) => s.setFormInfo);
  const setPreviews = useDicomStore((s) => s.setPreviews);
  const setTaskId = useDicomStore((s) => s.setTaskId);
  const previews = useDicomStore((s) => s.previews) as Preview[] | undefined;

  const inputRef = useRef<HTMLInputElement>(null);

  function capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  // reset proyecto cuando cambia empresa en modo existente
  useEffect(() => {
    setProyectoSel('');
  }, [empresaSel]);

  // Evitar que el navegador “abra” archivos si los soltás fuera del dropzone
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  // -------- drag & drop utils ----------
 // Poné esto en lugar de tu pickDicoms
function pickDicoms(list: FileList | File[] | null | undefined): File[] {
  if (!list) return [];
  // tipamos explícitamente el array de entrada
  const arr: File[] = Array.isArray(list) ? list : Array.from(list as FileList);

  // devolvemos sólo .dcm (algunos vienen sin type -> miramos extensión)
  return arr.filter((f: File) => {
    const name = f.name?.toLowerCase?.() ?? "";
    const type = f.type ?? "";
    return (
      name.endsWith(".dcm") ||
      type === "application/dicom" ||
      (type === "" && name.endsWith(".dcm"))
    );
  });
}


  async function ingestFiles(newFiles: File[]) {
    // dedupe por name+size+mtime
    const keyOf = (f: File) => `${f.name}::${f.size}::${f.lastModified}`;
    const newOnes: File[] = [];

    setFiles((prev) => {
      const next = [...prev];
      const existingKeys = new Set(prev.map(keyOf));
      for (const f of newFiles) {
        const k = keyOf(f);
        if (!existingKeys.has(k)) {
          next.push(f);
          newOnes.push(f);
          existingKeys.add(k);
        }
      }
      return next;
    });

    // generar previews para los nuevos
    const newPreviews: Preview[] = [];
    for (const file of newOnes) {
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      try {
        const image = await cornerstone.loadAndCacheImage(imageId);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const imageData = ctx.createImageData(image.width, image.height);
        const pixelData = image.getPixelData() as Uint16Array | Uint8Array;
        const slope = (image as any).slope ?? 1;
        const intercept = (image as any).intercept ?? 0;
        const wc = Array.isArray((image as any).windowCenter)
          ? (image as any).windowCenter[0]
          : (image as any).windowCenter ?? 128;
        const ww = Array.isArray((image as any).windowWidth)
          ? (image as any).windowWidth[0]
          : (image as any).windowWidth ?? 256;

        for (let i = 0; i < pixelData.length; i++) {
          const modalityLutValue = Number(pixelData[i]) * slope + intercept;
          const grayscale = Math.min(
            255,
            Math.max(0, ((modalityLutValue - (wc - 0.5)) / (ww - 1) + 0.5) * 255)
          );
          imageData.data[i * 4 + 0] = grayscale;
          imageData.data[i * 4 + 1] = grayscale;
          imageData.data[i * 4 + 2] = grayscale;
          imageData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        newPreviews.push({ name: file.name, url: canvas.toDataURL('image/png') });
      } catch (err) {
        console.error(`Error cargando imagen DICOM ${file.name}:`, err);
      }
    }

    const curr = (useDicomStore.getState().previews as Preview[] | undefined) ?? [];
    setPreviews([...curr, ...newPreviews]);
  }

  // -------- inputs ----------
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  const picked: File[] = pickDicoms(e.target.files);
  if (!picked.length) {
    setErrores({ files: "Elegí archivos .dcm" });
  } else {
    setErrores((prev) => ({ ...prev, files: undefined }));
    await ingestFiles(picked);
  }
  input.value = "";
};


  // -------- drag handlers ----------
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

  const dt = e.dataTransfer;

  // De items a File[], bien tipado
  const fromItems: File[] = [];
  if (dt.items && dt.items.length) {
    for (const it of Array.from(dt.items)) {
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f) fromItems.push(f);
      }
    }
  }

  // Si no hubo items, usamos FileList -> File[]
  const fallback: File[] = dt.files ? Array.from(dt.files) : [];
  const all: File[] = fromItems.length ? fromItems : fallback;

  const dicoms: File[] = pickDicoms(all);
  if (!dicoms.length) {
    setErrores({ files: "Arrastrá únicamente archivos .dcm" });
    return;
  }
  setErrores((prev) => ({ ...prev, files: undefined }));
  await ingestFiles(dicoms);
};


  // -------- continuar ----------
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

    let clienteNombre = '';
    let proyectoNombre = '';

    if (modo === 'existente') {
      clienteNombre = empresaSel;
      proyectoNombre = proyectoSel;
    } else {
      clienteNombre = empresaNueva.trim();
      proyectoNombre = proyectoNuevo.trim();
    }

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
      console.error('❌ Error al subir imágenes:', error);
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

  const botonDeshabilitado = subiendo;

  // IDs para labels/inputs (accesibilidad)
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
                <button
                  type="button"
                  className={styles.clearAllButton}
                  onClick={handleClearAll}
                >
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
          {/* dejaste este inner, lo mantengo sin tocar */}
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
                  {(empresaSel
                    ? PROYECTOS_FAKE[empresaSel as keyof typeof PROYECTOS_FAKE]
                    : []
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
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

            <button
              className={styles.nextButton}
              onClick={handleUploadAndNext}
              disabled={botonDeshabilitado}
            >
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
