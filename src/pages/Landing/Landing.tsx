import "./LandingGlobals.css";
import styles from "./Landing.module.css";

import { useState } from "react";
import { motion } from "framer-motion";

import { FloatingNav } from "../../components/ui/floating-navbar";
import { TypewriterEffect } from "../../components/ui/typewriter-effect";
import { FlipWords } from "../../components/ui/flip-words";
import { HoverBorderGradient } from "../../components/ui/hover-border-gradient";
import { StickyScroll } from "../../components/ui/sticky-scroll-reveal";
import { Compare } from "../../components/ui/compare";

import FeatureCards from "./FeatureCards";
import ContactUsForm from "../../components/ContactUsForm";

export type StickyItem = {
  title: React.ReactNode;        // antes: string
  description: React.ReactNode;  // por si luego querés formatear
  content: React.ReactNode;
};

export default function Landing() {
  const [showSublead, setShowSublead] = useState(false);

  return (
    <div className="landing">
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
              <img src="/IMAGOTIPO.png" alt="PipeEye" className={styles.logo} />
            </a>
          </div>
        </header>

        <main>
          {/* HERO */}
          <section className={styles.hero}>
            <div className={`${styles.container} ${styles.heroGrid}`}>
              <div className={styles.heroText}>
                {/* Heading principal */}
                <div className={styles.headingSlot} data-slot="heading">
                  <TypewriterEffect
                    className="mb-2"
                    cursorClassName="bg-blue-500"
                    words={[
                      { text: "Revolucionaria", className: "text-white-200" },
                      { text: "inspección", className: "text-white-200" },
                      { text: "de", className: "text-white-200" },
                      { text: "ductos", className: "text-white-200" },
                      { text: "con", className: "text-white-200" },
                      { text: "Inteligencia", className: "text-blue-400" },
                      { text: "Artificial.", className: "text-blue-400" },
                    ]}
                    onComplete={() => setShowSublead(true)}
                  />
                </div>

                {/* Sublead con transición */}
                {showSublead && (
                  <motion.p
                    className={styles.sublead}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    Automatizá la detección de fisuras y documentá decisiones
                    con un flujo de revisión humana.
                  </motion.p>
                )}

                <div className={styles.ctaRow}>
                  <HoverBorderGradient
                    href="#contacto"
                    className="font-semibold px-10 py-4 text-lg"
                  >
                    Contáctanos
                  </HoverBorderGradient>
                </div>
              </div>

              <div className={styles.heroMedia}>
                <video
                  src="/tuboVideo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={styles.heroVideo}
                />
              </div>
            </div>
          </section>

          {/* PARTNER: ENOD */}
          <section aria-labelledby="partners" className={styles.partners}>
            <div className={styles.container}>
              <h2 id="partners" className={styles.kicker}>
                La innovación en IA, de la mano de ENOD
              </h2>
              <div className={styles.partnerRow}>
                <img
                  src="/img/ENOD.png"
                  alt="ENOD"
                  className={styles.partnerLogo}
                />
              </div>
            </div>
          </section>

          {/* SCROLL EFFECT + FRASE */}
          <section className={styles.scrollEffectSection}>
            <div className={styles.container}>
              <div className={styles.scrollSlot} data-slot="scroll-effect">
                <div className={styles.centrar}>
                  <section className={styles.richText}>
                    <div className={styles.container}>
                      <div className={styles.textSlot} data-slot="richtext">
                        <p>Inicia tu proyecto</p>
                        <FlipWords
                          words={["cuando", "donde", "como"]}
                          duration={2200}
                          className="text-[#24A8FF]"
                        />
                        <p>lo necesites.</p>
                      </div>
                    </div>
                  </section>
                </div>

                <StickyScroll
  scrollMode="page"
  sectionClassName="rounded-none"
  content={
    [
      {
        title: (
          <div className={styles.stickyTitleWrap}>
            <p className={`${styles.kicker} ${styles.eyebrow}`}>
              ORGANIZACIÓN DE PROYECTOS
            </p>
            <span>Todos tus proyectos, ordenados en un solo lugar</span>
          </div>
        ),
        description:
          "Centralizá y gestioná múltiples inspecciones desde una misma plataforma, sin perder control ni visibilidad.",
        content: (
          <img
            alt="Detecciones IA"
            src="/img/1scroll.png"
            className="h-full w-full object-cover bg-transparent"
          />
        ),
      },
      {
        title: (
          <div className={styles.stickyTitleWrap}>
            <p className={`${styles.kicker} ${styles.eyebrow}`}>
              DETECCIÓN AUTOMÁTICA
            </p>
            <span>Detectá fallas automáticamente con IA</span>
          </div>
        ),
        description:
          "Nuestro sistema analiza imágenes y radiografías de ductos en tiempo real, identificando grietas, corrosión y anomalías invisibles al ojo humano",
        content: (
          <img
            alt="Detecciones IA"
            src="/img/2scroll.png"
            className="h-full w-full object-cover bg-transparent"
          />
        ),
      },
      {
        title: (
          <div className={styles.stickyTitleWrap}>
            <p className={`${styles.kicker} ${styles.eyebrow}`}>
              MÉTRICAS Y REPORTES
            </p>
            <span>Datos y estadísticas claras por cada inspección</span>
          </div>
        ),
        description:
          "Accedé a reportes detallados de cada proyecto: radiografías analizadas, aprobadas, en revisión o rechazadas. Visualizá gráficos interactivos y exportá la información cuando lo necesites.",
        content: (
          <img
            alt="Detecciones IA"
            src="/img/3scroll.png"
            className="h-full w-full object-cover bg-transparent"
          />
        ),
      },
    ] /* as StickyItem[] si tu tipo lo permite */
  }
/>
              </div>
            </div>
          </section>


          {/* TRUST / ACCESS SECTION */}
<section className={styles.trust}>
  <div className={styles.container}>
    <div className={styles.trustInner}>
      <span aria-hidden className={styles.trustRule} />

      <div className={styles.trustCopy}>
        <p className={styles.kickerTrust}>
          LOS USUARIOS YA ESTÁN DENTRO
        </p>

        <p className={styles.trustLead}>
          Cada vez más profesionales confían en nuestra plataforma.
        </p>

        <p className={styles.trustSub}>
          Si ya tenés una cuenta, accedé directamente y seguí con tus análisis.
        </p>

        <a
          href="http://localhost:5173/login"
          className={styles.trustCta}
        >
          Ya tengo una cuenta →
        </a>
      </div>
    </div>
  </div>
</section>

          {/* POR QUÉ */}
          <section id="por-que" className={styles.why}>
            <div className={styles.container}>
              <h2 className={styles.h2}>¿Por qué elegir PipeEye?</h2>
              <p className={styles.lead}>
                Priorizamos precisión, trazabilidad y colaboración entre
                equipos técnicos y de control de calidad.
              </p>
              <FeatureCards />
            </div>
          </section>

          {/* QUIÉNES SOMOS */}
          <section id="quienes" className={styles.quienes}>
            <div className={`${styles.container} ${styles.quienesGrid}`}>
              <div className={styles.teamMedia}>
                <span className={styles.mediaPlaceholder}>
                  <img src="/SobreNosotros.png" alt="" />
                </span>
              </div>
              <div>
                <h2 className={styles.h2}>¿Quiénes somos?</h2>
                <p className={styles.body}>
                  Detrás de PipeEye hay un grupo apasionado por la tecnología y
                  la innovación aplicada a la energía. Trabajamos en alianza con
                  ENOD para integrar inteligencia artificial, diseño y
                  usabilidad en una herramienta capaz de transformar la manera
                  en que se inspeccionan ductos. Nos mueve el desafío de
                  resolver problemas reales con soluciones simples y efectivas.
                </p>
              </div>
            </div>
          </section>

          {/* SOBRE */}
          <section id="sobre" className={styles.sobre}>
            <div className={styles.containerSobre}>
              <div className={styles.txtcontainerSobre}>
              <h2 className={styles.h2}>¿Como funciona el proyecto?</h2>
              <p className={styles.sobreInfo}>
                PipeEye aplica inteligencia artificial para el análisis
                automatizado de radiografías DICOM de oleoductos. Las imágenes
                se someten a un preprocesamiento avanzado y luego son evaluadas
                por un modelo de visión computacional que detecta fisuras
                conforme a la norma API 1104 y clasifica cada hallazgo.
                Posteriormente, el técnico puede validar o corregir las
                detecciones, y el sistema genera reportes automáticos
                segmentados por rol. </p>
                <p>
                En la comparación a continuación, los
                círculos amarillos corresponden a las marcas realizadas por
                nuestro equipo para entrenar la IA, mientras que los azules
                representan las detecciones automáticas del modelo, evidenciando
                su nivel de precisión.
              </p>
              <h3>¡Pruebalo Ahora! →</h3>
              </div>

              <div className={styles.predictsContainer}>
                <div className={styles.predicts}>
                 <Compare
  firstImage="/img/predicts.png"
  secondImage="/img/iaResults.png"
  slideMode="hover"
  className="w-[500px] h-[500px] rounded-2xl "
  // shadow-[0_0_60px_10px_var(--color-primario)]
/>

                </div>
              </div>
            </div>
          </section>

          <ContactUsForm />
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
    </div>
  );
}
