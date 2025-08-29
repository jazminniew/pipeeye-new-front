import styles from "./Landing.module.css";
import { FloatingNav } from "../../components/ui/floating-navbar";
import { TypewriterEffect } from "../../components/ui/typewriter-effect";
import { FlipWords } from "../../components/ui/flip-words";
import { LayoutGrid } from "../../components/ui/layout-grid";
import { useState } from "react";
import { motion } from "framer-motion";
import { HoverBorderGradient } from "../../components/ui/hover-border-gradient";
import { StickyScroll } from "../../components/ui/sticky-scroll-reveal";
import FeatureCards from "./FeatureCards";
import { Compare } from "../../components/ui/compare"; // ajustá la ruta si tu archivo se llama distinto


// Define StickyItem type if not imported from elsewhere
type StickyItem = {
  title: string;
  description: string;
  content: React.ReactNode;
};

export default function Landing() {
     const [showSublead, setShowSublead] = useState(false);

     
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
            <img src="/IMAGOTIPO.png" alt="PipeEye" className={styles.logo} />
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
      <video
        src="/tuboVideo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  </div>
</section>


        {/* PARTNER: ENOD */}
        <section aria-labelledby="partners" className={styles.partners}>
          <div className={styles.container}>
            <h2 id="partners" className={styles.kicker}>La innovación en IA, de la mano de ENOD</h2>
            <div className={styles.partnerRow}>
              <img src="/img/ENOD.png" alt="ENOD" className={styles.partnerLogo} />
            </div>
          </div>
        </section>


<section className={styles.scrollEffectSection}>
  
  <div className={styles.container}>
    
    <div className={styles.scrollSlot} data-slot="scroll-effect">
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
      <StickyScroll
        scrollMode="page" // 👈 importante (aunque ahora es el default)
        sectionClassName="rounded-none" // opcional
        content={[
          {
            title: "Todos tus proyectos, ordenados en un solo lugar",
            description:
              "Centralizá y gestioná múltiples inspecciones desde una misma plataforma, sin perder control ni visibilidad.",
            content: (
              <img
                alt="Detecciones IA"
                src="/img/1scroll.png"
                className="h-full w-full object-cover"
              />
            ),
          },
          {
            title: "Detectá fallas automáticamente con IA",
            description:
              "Nuestro sistema analiza imágenes y radiografías de ductos en tiempo real, identificando grietas, corrosión y anomalías invisibles al ojo humano",
            content: (
              <img
                alt="Detecciones IA"
                src="/img/2scroll.png"
                className="h-full w-full object-cover"
              />
            ),
          },
          {
            title: "Datos y estadísticas claras por cada inspección",
            description:
              "Accedé a reportes detallados de cada proyecto: radiografías analizadas, aprobadas, en revisión o rechazadas. Visualizá gráficos interactivos y exportá la información cuando lo necesites.",
            content: (
              <img
                alt="Detecciones IA"
                src="/img/3scroll.png"
                className="h-full w-full object-cover"
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
    <p className={styles.lead}>
      Priorizamos precisión, trazabilidad y colaboración entre equipos técnicos y de control de calidad.
    </p>

    {/* NUEVO */}
    <FeatureCards />
  </div>
</section>
        {/* QUIÉNES SOMOS */}
        <section id="quienes" className={styles.quienes}>
          <div className={`${styles.container} ${styles.quienesGrid}`}>
              <div className={styles.teamMedia}>
              <span className={styles.mediaPlaceholder}><img src="/SobreNosotros.png" alt="" /></span>
            </div>
            <div>
              <h2 className={styles.h2}>¿Quiénes somos?</h2>
              <p className={styles.body}>
                Detrás de PipeEye hay un grupo apasionado por la tecnología y la innovación aplicada a la energía. Trabajamos en alianza con ENOD para integrar inteligencia artificial, diseño y usabilidad en una herramienta capaz de transformar la manera en que se inspeccionan ductos. Nos mueve el desafío de resolver problemas reales con soluciones simples y efectivas.
              </p>
            </div>

          </div>

          <section id="galeria" className={styles.galeria}>
  <div className={styles.container}>
<LayoutGrid
  cards={[
    {
      id: 1,
      content: <p>PipeEye se desarrolla en el marco de la orientación TIC de ORT Argentina, un espacio de formación técnica en tecnologías de la información y la comunicación que fomenta la innovación, el trabajo colaborativo y la aplicación práctica de la programación y el diseño para dar respuesta a desafíos reales de la industria.</p>,
      // 👉 ancho 2 columnas, altura fija igual que el min-h del componente
      className: "col-span-1 md:col-span-2 h-[16rem] md:h-[18rem] rounded-2xl",
      thumbnail: "/img/tic.jpg",
    },
    {
      id: 2,
      content: <p>Cambiar img.</p>,
      // 👉 1 columna, misma altura
      className: "col-span-1 md:col-span-1 h-[16rem] md:h-[18rem] rounded-2xl",
      thumbnail: "/img/sede-ort.jpg",
    },
    {
      id: 3,
      content: <p>Como equipo de la orientación TIC de ORT Argentina, dividimos nuestros roles para potenciar lo que mejor sabe hacer cada uno: desde el desarrollo frontend y backend hasta el diseño UX/UI y la gestión del proyecto. Esta organización nos permitió trabajar de manera colaborativa, iterando por sprints y construyendo una solución integral con impacto real en la industria.</p>,
      // 👉 1 columna, misma altura (nada de row-span)
      className: "col-span-1 md:col-span-1 h-[16rem] md:h-[18rem] rounded-2xl",
      thumbnail: "/img/nosotros.png",
    },
    {
      id: 4,
      content: <p>PipeEye nació en el marco del colegio ORT Argentina, una institución de educación técnica que impulsa a sus estudiantes a desarrollar proyectos innovadores, integrando programación, diseño y trabajo en equipo para resolver problemas reales con impacto en la industria.</p>,
      // 👉 ancho 2 columnas, misma altura
      className: "col-span-1 md:col-span-2 h-[16rem] md:h-[18rem] rounded-2xl",
      thumbnail: "/img/ort.png",
    },
  ]}
/>


  </div>
</section>
        </section>


        {/* SOBRE NOSOTROS */}
        <section id="sobre" className={styles.sobre}>
          <div className={styles.container}>
            <h2 className={styles.h2}>¿Como funciona el proyecto?</h2>
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

            <Compare
              firstImage="/img/ort.png"
              secondImage="/img/tic.jpg"
              slideMode="hover"
              className="w-[500px] h-[300px] rounded-2xl"
            />
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

