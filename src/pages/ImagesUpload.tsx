// src/pages/ImageUpload.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import { useDicomStore } from '../store/dicomStore';
import Header from '../components/Navbar';
import styles from '../styles/ImageUpload.module.css';
import { apiFetch } from '../lib/api';

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
type ModoProyecto = 'existente' | 'nuevo';
const EMPRESAS_FAKE = ['ENOD', 'YPF', 'Total', 'Pampa Energía'] as const;
const PROYECTOS_FAKE: Record<(typeof EMPRESAS_FAKE)[number], string[]> = {
  ENOD: ['Oleoducto Sur', 'Inspección Q3', 'Reparación 12B'],
  YPF: ['Batería La Plata', 'Yacimiento X-17'],
  Total: ['Gasoducto Norte', 'Relevamiento Anual'],
  'Pampa Energía': ['Planta Dock Sud', 'Parada de Planta'],
};
// ID fijo mientras todo es fake (cámbialo cuando uses el real)
const PROYECTO_ID_POST = 2;

const ImageUpload: React.FC = () => {
  // izquierda
  const [files, setFiles] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  // derecha (común)
  const [modo, setModo] = useState<ModoProyecto>('existente');
  const [fecha, setFecha] = useState('');

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

  // reset proyecto cuando cambia empresa en modo existente
  useEffect(() => {
    setProyectoSel('');
  }, [empresaSel]);

  // === previews (igual que ya tenías) ===
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);

    const previewsResult: { name: string; url: string }[] = [];
    for (const file of selected) {
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
        const dataUrl = canvas.toDataURL('image/png');
        previewsResult.push({ name: file.name, url: dataUrl });
      } catch (err) {
        console.error(`Error cargando imagen DICOM ${file.name}:`, err);
      }
    }
    setPreviews(previewsResult);
  };

  // === continuar (solo decide nombres FAKE y sube con proyecto_id fijo) ===
  const handleUploadAndNext = async () => {
    if (files.length === 0) {
      alert('Subí al menos una imagen .dcm');
      return;
    }
    if (!fecha) {
      alert('Completá la fecha.');
      return;
    }

    // elegir nombres según modo (SOLO LÓGICA FAKE)
    let clienteNombre = '';
    let proyectoNombre = '';

    if (modo === 'existente') {
      if (!empresaSel || !proyectoSel) {
        alert('Seleccioná empresa y proyecto.');
        return;
      }
      clienteNombre = empresaSel;
      proyectoNombre = proyectoSel;
    } else {
      if (!empresaNueva.trim() || !proyectoNuevo.trim()) {
        alert('Completá nombre de empresa y proyecto.');
        return;
      }
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
        // guardo SOLO los nombres e inputs para Analyze
        setFormInfo({ cliente: clienteNombre, proyecto: proyectoNombre, fecha });
        navigate('/analyzeImages');
      } else {
        alert('Error: no se recibió task_id del backend.');
      }
    } catch (error: any) {
      console.error('❌ Error al subir imágenes:', error);
      if (error?.message === 'UNAUTHORIZED') {
        alert('Sesión expirada. Iniciá sesión de nuevo.');
        navigate('/');
      } else {
        alert('Error al subir imágenes al backend.');
      }
    } finally {
      setSubiendo(false);
    }
  };

  const botonDeshabilitado =
    subiendo ||
    files.length === 0 ||
    !fecha ||
    (modo === 'existente'
      ? !empresaSel || !proyectoSel
      : !empresaNueva.trim() || !proyectoNuevo.trim());

  return (
    <div className={styles.body}>
      <Header />
      <div className={styles.container}>
        {/* IZQUIERDA */}
        <div className={styles.leftSection}>
          <div className={styles.dropZone}>
            <p><strong>Arrastrá tus imágenes DICOM</strong></p>
            <p className={styles.secondaryText}>o hacé clic para seleccionar archivos</p>
            <label htmlFor="fileInput" className={styles.customFileButton}>Subir imagen</label>
            <input
              id="fileInput"
              type="file"
              accept=".dcm"
              multiple
              onChange={handleFileChange}
              className={styles.hiddenInput}
            />
            <p className={styles.compatibleText}>Formatos permitidos: .dcm</p>
          </div>

          {files.length > 0 && (
            <div className={styles.previewContainer}>
              <div className={styles.previewHeader}>
                <h3>Archivos seleccionados</h3>
              </div>
              <div className={styles.fileList}>
                {files.map((file, idx) => (
                  <div key={idx} className={styles.fileName}>
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DERECHA */}
        <div className={styles.rightSection}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${modo === 'existente' ? styles.tabActive : ''}`}
              onClick={() => setModo('existente')}
            >
              Proyecto existente
            </button>
            <button
              className={`${styles.tab} ${modo === 'nuevo' ? styles.tabActive : ''}`}
              onClick={() => setModo('nuevo')}
            >
              Proyecto nuevo
            </button>
          </div>

          <h2>Completar la siguiente información</h2>

          {modo === 'existente' ? (
            <>
              <label>Empresa</label>
              <select
                className={styles.select}
                value={empresaSel}
                onChange={(e) => setEmpresaSel(e.target.value)}
              >
                <option value="">Nombre empresa</option>
                {EMPRESAS_FAKE.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <label>Proyecto</label>
              <select
                className={styles.select}
                value={proyectoSel}
                onChange={(e) => setProyectoSel(e.target.value)}
                disabled={!empresaSel}
              >
                <option value="">Nombre del proyecto</option>
                {(empresaSel ? PROYECTOS_FAKE[empresaSel as keyof typeof PROYECTOS_FAKE] : []).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label>Empresa</label>
              <input
                placeholder="Nombre empresa"
                value={empresaNueva}
                onChange={(e) => setEmpresaNueva(e.target.value)}
              />

              <label>Proyecto</label>
              <input
                placeholder="Nombre del proyecto"
                value={proyectoNuevo}
                onChange={(e) => setProyectoNuevo(e.target.value)}
              />
            </>
          )}

          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

          <button
            className={styles.nextButton}
            onClick={handleUploadAndNext}
            disabled={botonDeshabilitado}
          >
            {subiendo ? 'Subiendo…' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
