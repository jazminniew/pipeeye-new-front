import styles from "./Landing.module.css";
import { FloatingNav } from "../../components/ui/floating-navbar";
import { TypewriterEffect } from "../../components/ui/typewriter-effect";
import { FlipWords } from "../../components/ui/flip-words";
import { useState } from "react";
import { motion } from "framer-motion";
import { HoverBorderGradient } from "../../components/ui/hover-border-gradient";
import { StickyScroll } from "../../components/ui/sticky-scroll-reveal";

export default function Landing() {
     const [showSublead, setShowSublead] = useState(false);

  const stickyContent: StickyItem[] = [
    {
      title: "Subí tus radiografías",
      description:
        "Cargá ZIPs con múltiples DICOM y centralizá el análisis en un solo flujo.",
      content: (
        <div className="h-full w-full flex items-center justify-center text-white/90 p-4">
          <span className="text-center text-sm">
            Dropzone + validación DICOM
          </span>
        </div>
      ),
    },
    {
      title: "IA que prioriza tu revisión",
      description:
        "Detectamos y clasificamos fisuras según normas; vos confirmás y corregís.",
      content: (
        <img
          alt="Detecciones IA"
          src="/img/detecciones_mock.png"
          className="h-full w-full object-cover"
        />
      ),
    },
    {
      title: "Trazabilidad y reportes",
      description:
        "Auditoría por rol y reportes listos para compartir con tu cliente.",
      content: (
        <div className="h-full w-full p-4 flex items-center justify-center">
          <video
            src="/video/report_demo.mp4"
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      ),
    },
  ];
     
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <FloatingNav
  navItems={[
    { name: "¿Que hacemos?", link: "#por-que" },
    { name: "¿Quienes Somos?", link: "#quienes" },
  ]}
/>
      <header className={styles.header}>
        <div className={styles.container}>
          <a href="" className={styles.logoWrap}>
            <img src="public/IMAGOTIPO.png" alt="PipeEye" className={styles.logo} />
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
<section className={styles.hero}>
  <div className={`${styles.container} ${styles.heroGrid}`}>
    <div className={styles.heroText}>
      {/* SLOT: Heading principal */}
      <div className={styles.headingSlot} data-slot="heading">
        <TypewriterEffect
          className="mb-2"
          cursorClassName="bg-blue-500"
          words={[
            { text: "Revolucionaria", className: "text-white-200" },
            { text: "inspección", className: "text-white-200" },
            { text: "de",  className: "text-white-200" },
            { text: "ductos", className: "text-white-200" },
            { text: "con",  className: "text-white-200"},
            { text: "Inteligencia",  className: "text-blue-400"},
            { text: "Artificial.",  className: "text-blue-400"}

          ]}
           onComplete={() => setShowSublead(true)}
        />
      </div>

{/* sublead con transición */}
{showSublead && (
  <motion.p
    className={styles.sublead}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    Automatizá la detección de fisuras y documentá decisiones con un flujo de revisión humana.
  </motion.p>
)}

      <div className={styles.ctaRow}>
        <HoverBorderGradient>
        <span>Contactános</span>
        </HoverBorderGradient>
      </div>
    </div>

    <div className={styles.heroMedia}>
       <img src="public/img/hero_img.png" alt="PipeEye" />
    </div>
  </div>
</section>


        {/* PARTNER: ENOD */}
        <section aria-labelledby="partners" className={styles.partners}>
          <div className={styles.container}>
            <h2 id="partners" className={styles.kicker}>La innovación en IA, de la mano de ENOD</h2>
            <div className={styles.partnerRow}>
              <img src="public/img/ENOD.png" alt="ENOD" className={styles.partnerLogo} />
            </div>
          </div>
        </section>

        {/* TEXTO (de librería) */}
        <div className={styles.centrar}>
        <section className={styles.richText}>
          <div className={styles.container}>
            <div className={styles.textSlot} data-slot="richtext">
    <p>Inicia tu proyecto</p>
    <FlipWords
    words={[
      "cuando",
      "donde",
      "como",
    ]}
    duration={2200}
    className="text-[#24A8FF]"
  />
  <p>lo necesites.</p>
            </div>
          </div>
          
        </section>
        </div>

<section className={styles.scrollEffectSection}>
  <div className={styles.container}>
    <div className={styles.scrollSlot} data-slot="scroll-effect">
      <StickyScroll
        scrollMode="page" // 👈 importante (aunque ahora es el default)
        sectionClassName="rounded-none" // opcional
        content={[
          {
            title: "Subí tus radiografías",
            description:
              "Cargá ZIPs con múltiples DICOM y centralizá el análisis en un solo flujo.",
            content: (
              <div className="h-full w-full flex items-center justify-center text-white/90 p-4">
                <span className="text-center text-sm">
                  Dropzone + validación DICOM
                </span>
              </div>
            ),
          },
          {
            title: "IA que prioriza tu revisión",
            description:
              "Detectamos y clasificamos fisuras según normas; vos confirmás y corregís.",
            content: (
              <img
                alt="Detecciones IA"
                src="/img/detecciones_mock.png"
                className="h-full w-full object-cover"
              />
            ),
          },
          {
            title: "Trazabilidad y reportes",
            description:
              "Auditoría por rol y reportes listos para compartir con tu cliente.",
            content: (
              <video
                src="/video/report_demo.mp4"
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ),
          },
        ] satisfies StickyItem[]}
      />
    </div>
  </div>
</section>

        {/* POR QUÉ ELEGIR PIPEEYE */}
        <section id="por-que" className={styles.why}>
          <div className={styles.container}>
            <h2 className={styles.h2}>¿Por qué elegir PipeEye?</h2>
            <p className={styles.lead}>Priorizamos precisión, trazabilidad y colaboración entre equipos técnicos y de control de calidad.</p>
            <div className={styles.cardGrid}>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>Detección asistida por IA</h3>
                <p className={styles.cardText}>Modelos entrenados para identificar tipos de fisuras y priorizar revisión humana.</p>
              </article>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>Trazabilidad y normas</h3>
                <p className={styles.cardText}>Clasificación alineada a estándares (p.ej. API 1104) y auditoría completa.</p>
              </article>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>Workflow colaborativo</h3>
                <p className={styles.cardText}>Roles por permisos, correcciones manuales y reportes listos para compartir.</p>
              </article>
            </div>
          </div>
        </section>

        {/* QUIÉNES SOMOS */}
        <section id="quienes" className={styles.quienes}>
          <div className={`${styles.container} ${styles.quienesGrid}`}>
            <div>
              <h2 className={styles.h2}>Quiénes somos</h2>
              <p className={styles.body}>
                Somos un equipo interdisciplinario de estudiantes y colaboradores que trabajamos con ENOD para llevar la inspección de
                oleoductos al siguiente nivel: más rápida, más clara y con foco en la seguridad.
              </p>
            </div>
            <div className={styles.teamMedia}>
              <span className={styles.mediaPlaceholder}>Imagen del equipo / mock</span>
            </div>
          </div>
        </section>

        {/* SOBRE NOSOTROS */}
        <section id="sobre" className={styles.sobre}>
          <div className={styles.container}>
            <h2 className={styles.h2}>Sobre nosotros</h2>
            <p className={styles.body}>
              PipeEye nació como proyecto académico con ambición real: integrar visión computacional y prácticas de ingeniería de
              software para resolver un problema concreto del sector energético. Iteramos por sprints, documentamos resultados y diseñamos
              para el uso real en campo y oficina.
            </p>
            <ul className={styles.pills}>
              <li className={styles.pill}>FastAPI en backend</li>
              <li className={styles.pill}>React + TypeScript en frontend</li>
              <li className={styles.pill}>Reporte y auditoría por rol</li>
            </ul>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.containerFooter}>
          <p>© {new Date().getFullYear()} PipeEye</p>
          <nav className={styles.footerNav}>
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

