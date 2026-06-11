"use client";

import { useRef, useEffect, useState } from "react";
import Problem2Overlay from "./Problem2Overlay";

const TOTAL_FRAMES = 759;
const BATCH_SIZE = 20;

// Estilo del título — mismo para todas las secciones:
const sectionTitle = (title: string, color: string = '#000000') => (
  <p style={{
    position: 'absolute',
    top: '32px',
    left: '48px',
    color,
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
  }}>
    {title}
  </p>
);

interface Section {
  startFrame: number;
  endFrame: number;
  title: string;
  title2?: string;
  sub?: React.ReactNode;
  sub2?: string;
  customTop?: string;
}

const sections: Section[] = [
  {
    startFrame: 0,
    endFrame: 45,
    title: "FixedGap",
    sub: <>Sequential functional <strong className="text-cyan-400">telemonitoring</strong> of stroke recovery.</>,
    sub2: "From a game to the clinical decision that matters.",
  },
  {
    startFrame: 45,
    endFrame: 130,
    title: "The monitoring gap is structural.",
    sub: "673 post-stroke patients per clinician. Spaced visits.",
  },
  {
    startFrame: 130,
    endFrame: 300,
    title: "Recovery happens every day. So does deterioration.",
    sub: "Decisions are based on patient recall, not real data.",
  },
  {
    startFrame: 300,
    endFrame: 405,
    title: "We simplified the glove into pure software.",
    sub: "A device with a camera. No wearables. No setup.",
    sub2: "A SaaS platform — objective functional data after each session.",
  },
  {
    startFrame: 405,
    endFrame: 565,
    title: "Movement produces measurable signals.",
    title2: "We just need to capture them.",
    sub: "FixedGap captures functional data in real-time.",
    sub2: "And converts it into clinical insights — proactively.",
  },
  {
    startFrame: 565,
    endFrame: 720,
    title: "For patients, it's a game.",
    title2: "For clinicians, it's actionable data.",
  },
  {
    startFrame: 720,
    endFrame: 855,
    title: "Compatible with any device. iOS, Android, Web.",
    customTop: "75%",
  },
];

function getSectionOpacity(
  progress: number,
  section: { startFrame: number; endFrame: number }
): number {
  const start = section.startFrame / (TOTAL_FRAMES - 1);
  const end = section.endFrame / (TOTAL_FRAMES - 1);

  if (progress < start || progress > end) return 0;

  const range = end - start;
  if (range === 0) return 0;

  const fadeZone = range * 0.2;

  const fadeIn = fadeZone > 0 ? (progress - start) / fadeZone : 1;
  const fadeOut = fadeZone > 0 ? (end - progress) / fadeZone : 1;

  return Math.max(0, Math.min(1, fadeIn, fadeOut));
}

function getSectionTransform(
  progress: number,
  section: { startFrame: number; endFrame: number }
): number {
  const start = section.startFrame / (TOTAL_FRAMES - 1);
  const end = section.endFrame / (TOTAL_FRAMES - 1);

  if (progress < start || progress > end) return 0;

  const range = end - start;
  if (range === 0) return 0;

  const fadeZone = range * 0.2;
  const fadeIn = fadeZone > 0 ? (progress - start) / fadeZone : 1;
  const fadeOut = fadeZone > 0 ? (end - progress) / fadeZone : 1;

  if (fadeIn < 1) {
    return 30 * (1 - fadeIn);
  }

  if (fadeOut < 1) {
    return -30 * (1 - fadeOut);
  }

  return 0;
}

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const scrollProgressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollLockedRef = useRef(false);
  const lastLockedFrameRef = useRef<number>(-1);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const problemContentRef = useRef<HTMLDivElement | null>(null);
  const problem2ContentRef = useRef<HTMLDivElement | null>(null);
  const whatIfRef = useRef<HTMLDivElement | null>(null);
  const solutionRef = useRef<HTMLDivElement | null>(null);
  const laptopRef = useRef<HTMLDivElement | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const tractionRef = useRef<HTMLDivElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const snapFrames = [1, 95, 225, 350, 483, 616, 720];

  const pitchTexts: { [key: number]: string } = {
    1: "PROBLEM",
    95: "PROBLEM 2",
    225: "WHAT IF THERE WAS A SOLUTION FOR THIS GAP",
    350: "OUR SOLUTION",
    483: "CLINICAL VIEW",
    616: "BUSINESS PLAN",
    720: "From Idea to Clinical Validation"
  };

  // Mapeo de frames de referencia a imágenes HQ
  const hqFrameMapping: { [key: number]: number } = {
    1: 1,    // ref 1
    95: 2,   // ref 2
    225: 3,  // ref 3
    350: 4,  // ref 4 (falta archivo)
    483: 5,  // ref 5
    616: 6,  // ref 6
    720: 7   // ref 7
  };

  const hqImagesRef = useRef<{ [key: number]: HTMLImageElement }>({});

  // Load HQ reference images first
  useEffect(() => {
    const hqImages: { [key: number]: HTMLImageElement } = {};
    let loadedHQ = 0;
    const totalHQ = Object.keys(hqFrameMapping).length;

    Object.entries(hqFrameMapping).forEach(([frame, refNum]) => {
      const img = new Image();
      img.src = `/frames-hq/${refNum}.png`;

      img.onload = () => {
        hqImages[parseInt(frame)] = img;
        loadedHQ++;
        if (loadedHQ === totalHQ) {
          hqImagesRef.current = hqImages;
        }
      };

      img.onerror = () => {
        console.warn(`No se pudo cargar imagen HQ: ${refNum}.png`);
        loadedHQ++;
      };
    });
  }, []);

  // Batch loading of frames
  useEffect(() => {
    const frames: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let count = 0;
    let cancelled = false;

    const loadBatch = (startIdx: number) => {
      const end = Math.min(startIdx + BATCH_SIZE, TOTAL_FRAMES);
      for (let i = startIdx; i < end; i++) {
        const img = new Image();
        img.src = `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;
        frames[i] = img;

        const onDone = () => {
          if (cancelled) return;
          count++;
          setLoadedCount(count);
          if (count === TOTAL_FRAMES) {
            framesRef.current = frames;
            setLoaded(true);
          }
        };

        img.onload = onDone;
        img.onerror = onDone;
      }

      if (end < TOTAL_FRAMES) {
        setTimeout(() => loadBatch(end), 0);
      }
    };

    loadBatch(0);
    return () => { cancelled = true; };
  }, []);

  // Scroll lock system
  useEffect(() => {
    if (!loaded) return;

    const handleWheel = (e: WheelEvent) => {
      if (scrollLockedRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (scrollLockedRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("touchmove", handleTouchMove);
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, [loaded]);

  // Canvas rendering and section animations
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true
    });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      // Canvas con resolución de Retina/4K
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      // CSS size normal
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // Escalar el contexto
      ctx.scale(dpr, dpr);

      // Máxima calidad de renderizado
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const SCROLL_CONTAINER_HEIGHT = 30471;
      const cappedScroll = Math.min(window.scrollY, SCROLL_CONTAINER_HEIGHT);
      scrollProgressRef.current = cappedScroll / SCROLL_CONTAINER_HEIGHT;

      const progress = scrollProgressRef.current;
      const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1))));

      // Buscar si hay una imagen HQ para este frame (±15 frames de cualquier snap frame)
      let frame = framesRef.current[frameIdx];
      for (const snapFrame of snapFrames) {
        if (Math.abs(frameIdx - snapFrame) <= 15) {
          const hqImage = hqImagesRef.current[snapFrame];
          if (hqImage?.complete) {
            frame = hqImage;
          }
          break;
        }
      }

      // Check for lock frames
      for (const snapFrame of snapFrames) {
        if (Math.abs(frameIdx - snapFrame) <= 2 && lastLockedFrameRef.current !== snapFrame) {
          lastLockedFrameRef.current = snapFrame;
          scrollLockedRef.current = true;

          if (lockTimeoutRef.current) {
            clearTimeout(lockTimeoutRef.current);
          }

          lockTimeoutRef.current = setTimeout(() => {
            scrollLockedRef.current = false;
          }, 2500);

          break;
        }
      }

      // Reset lock when moving away from snap frames
      const nearSnapFrame = snapFrames.some(sf => Math.abs(frameIdx - sf) <= 2);
      if (!nearSnapFrame && lastLockedFrameRef.current !== -1 && !scrollLockedRef.current) {
        lastLockedFrameRef.current = -1;
      }

      if (frame?.complete && frame.naturalWidth > 0) {
        const cw = window.innerWidth;
        const ch = window.innerHeight;

        const isSmallMode = frameIdx >= 314;

        if (isSmallMode) {
          // Fondo blanco
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, cw, ch);

          // Imagen más pequeña y centrada (70% del viewport)
          const maxWidth = cw * 0.7;
          const maxHeight = ch * 0.7;

          const scale = Math.min(maxWidth / frame.naturalWidth, maxHeight / frame.naturalHeight);
          const dw = frame.naturalWidth * scale;
          const dh = frame.naturalHeight * scale;
          const x = (cw - dw) / 2;
          const y = (ch - dh) / 2;

          ctx.drawImage(frame, x, y, dw, dh);

          // A partir del frame 552, difuminado MUY amplio para igualar blancos
          const isExtraFade = frameIdx >= 552;
          const fadeSize = isExtraFade ? 350 : 200;
          const innerRadius = isExtraFade ? Math.min(dw, dh) / 3.5 : Math.min(dw, dh) / 2.5;

          const gradient = ctx.createRadialGradient(
            cw / 2,
            ch / 2,
            innerRadius,
            cw / 2,
            ch / 2,
            Math.max(dw, dh) / 2 + fadeSize
          );

          if (isExtraFade) {
            // Degradado extra suave para frames 552+
            gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(0.3, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
            gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.6)");
            gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.85)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 1)");
          } else {
            // Degradado normal para frames 314-551
            gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(0.4, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.5)");
            gradient.addColorStop(0.85, "rgba(255, 255, 255, 0.8)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 1)");
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, cw, ch);
        } else {
          // Modo normal: Scale to cover viewport (object-fit: cover)
          const scale = Math.max(cw / frame.naturalWidth, ch / frame.naturalHeight);
          const dw = frame.naturalWidth * scale;
          const dh = frame.naturalHeight * scale;

          ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);

          // Degradado negro en la parte inferior para ocultar marca de agua (frames 0-200)
          if (frameIdx <= 200) {
            const shadowGradient = ctx.createLinearGradient(0, ch - 180, 0, ch);
            shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
            shadowGradient.addColorStop(0.3, "rgba(0, 0, 0, 0.6)");
            shadowGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.9)");
            shadowGradient.addColorStop(1, "rgba(0, 0, 0, 1)");

            ctx.fillStyle = shadowGradient;
            ctx.fillRect(0, ch - 180, cw, 180);
          }
        }
      }


      // Update text overlays based on proximity to snap frames
      const scrollY = cappedScroll;
      const scrollHeight = SCROLL_CONTAINER_HEIGHT;
      snapFrames.forEach((snapFrame, i) => {
        const el = sectionRefs.current[i];
        if (el) {
          const snapScrollPos = (snapFrame / (TOTAL_FRAMES - 1)) * scrollHeight;
          const fadePixels = (20 / (TOTAL_FRAMES - 1)) * scrollHeight;
          const scrollDist = Math.abs(scrollY - snapScrollPos);
          const opacity = scrollDist <= fadePixels ? Math.max(0, 1 - scrollDist / fadePixels) : 0;
          el.style.opacity = String(opacity);

          // Update PROBLEM section content (frame 1)
          if (snapFrame === 1 && problemContentRef.current) {
            problemContentRef.current.style.opacity = String(opacity);
          }

          // Update PROBLEM 2 section content (frame 95)
          if (snapFrame === 95 && problem2ContentRef.current) {
            problem2ContentRef.current.style.opacity = String(opacity);
          }

          // Update WHAT IF section content (frame 225)
          if (snapFrame === 225 && whatIfRef.current) {
            whatIfRef.current.style.opacity = String(opacity);
          }

          // Update SOLUTION section content (frame 350)
          if (snapFrame === 350 && solutionRef.current) {
            solutionRef.current.style.opacity = String(opacity);
          }

          // Update LAPTOP section content (frame 483)
          if (snapFrame === 483 && laptopRef.current) {
            laptopRef.current.style.opacity = String(opacity);
          }

          // Update DASHBOARD section content (frame 616)
          if (snapFrame === 616 && dashboardRef.current) {
            dashboardRef.current.style.opacity = String(opacity);
          }

          // Update TRACTION section content (frame 720)
          if (snapFrame === 720 && tractionRef.current) {
            tractionRef.current.style.opacity = String(opacity);
          }
        }
      });

      // Fade out canvas when entering post-scroll sections
      if (canvasRef.current) {
        if (window.scrollY > SCROLL_CONTAINER_HEIGHT) {
          const fadeOut = Math.max(0, 1 - (window.scrollY - SCROLL_CONTAINER_HEIGHT) / 400);
          canvasRef.current.style.opacity = String(fadeOut);
        } else {
          canvasRef.current.style.opacity = "1";
        }
      }

      // Force traction visibility - visible near frame 720, hide when entering black sections
      if (tractionRef.current) {
        const snap720pos = (720 / (TOTAL_FRAMES - 1)) * SCROLL_CONTAINER_HEIGHT;
        const pastCanvas = window.scrollY > SCROLL_CONTAINER_HEIGHT;
        if (pastCanvas) {
          const fadeOut = Math.max(0, 1 - (window.scrollY - SCROLL_CONTAINER_HEIGHT) / 300);
          tractionRef.current.style.opacity = String(fadeOut);
        } else {
          const dist = scrollY - snap720pos;
          if (dist >= -1200 && dist <= 0) {
            tractionRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(dist) / 1200));
          } else if (dist > 0) {
            tractionRef.current.style.opacity = "1";
          } else {
            tractionRef.current.style.opacity = "0";
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [loaded]);

  return (
    <>
      {/* Loading screen */}
      {!loaded && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <h1 style={{
            color: "#fff",
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}>
            FixedGap
          </h1>
          <div style={{
            width: 300,
            height: 3,
            background: "#222",
            borderRadius: 2,
            marginTop: 32,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              background: "#fff",
              borderRadius: 2,
              width: `${(loadedCount / TOTAL_FRAMES) * 100}%`,
              transition: "width 0.08s linear",
            }} />
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: loaded ? "block" : "none",
          zIndex: 0,
        }}
      />

      {/* Scroll height container with snap points */}
      <div style={{ height: "30471px", position: "relative" }}>
        {snapFrames.map((frame) => {
          const scrollPosition = (frame / (TOTAL_FRAMES - 1)) * 30471;
          return (
            <div
              key={frame}
              style={{
                position: "absolute",
                top: `${scrollPosition}px`,
                width: "100%",
                height: "1px",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
              }}
            />
          );
        })}
      </div>

      {/* Spacer to hold on "From Idea to Clinical Validation" longer */}
      <div style={{ height: "80vh", position: "relative" }} />

      {/* ===== POST-SCROLL SECTIONS (Team, Ask, Cierre) ===== */}

      {/* TEAM */}
      <section
        style={{
          backgroundColor: "#000000",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(2rem, 5vw, 5rem)",
          gap: "clamp(1.5rem, 3vw, 2.5rem)",
          position: "relative",
          zIndex: 30,
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid rgba(0,255,255,0.3)",
            borderRadius: "999px",
            padding: "8px 16px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#00FFFF",
            }}
          />
          <span
            style={{
              color: "#00FFFF",
              fontSize: "clamp(11px, 1.2vw, 14px)",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            The Team
          </span>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            height: "clamp(200px, 35vh, 380px)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <img
            src="/team.jpeg"
            alt="The FixedGap team"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
            }}
          />
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(1rem, 2vw, 1.5rem)",
          }}
        >
          <div style={{ display: "flex", gap: "clamp(1.5rem, 4vw, 3rem)", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
            <p style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.4rem)", fontWeight: 700, margin: 0 }}>
              <span style={{ color: "#00FFFF" }}>Software</span>{" "}
              <span style={{ color: "#FFFFFF" }}>engineering</span>
            </p>
            <p style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.4rem)", fontWeight: 700, margin: 0 }}>
              <span style={{ color: "#00FFFF" }}>Biomedical</span>{" "}
              <span style={{ color: "#FFFFFF" }}>engineering</span>
            </p>
            <p style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.4rem)", fontWeight: 700, margin: 0 }}>
              <span style={{ color: "#FFFFFF" }}>Active</span>{" "}
              <span style={{ color: "#00FFFF" }}>physician</span>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/spain.png" alt="Spain" style={{ height: "clamp(20px, 2.5vw, 30px)", width: "auto", objectFit: "contain" }} />
            <img src="/usa.png" alt="USA" style={{ height: "clamp(20px, 2.5vw, 30px)", width: "auto", objectFit: "contain" }} />
            <img src="/HSIL.png" alt="Harvard HSIL" style={{ height: "clamp(20px, 2.5vw, 30px)", width: "auto", objectFit: "contain" }} />
          </div>
        </div>
      </section>

      {/* THE ASK */}
      <section
        style={{
          backgroundColor: "#000000",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(2rem, 5vw, 5rem)",
          gap: "clamp(1.5rem, 3vw, 3rem)",
          position: "relative",
          zIndex: 30,
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid rgba(0,255,255,0.3)",
            borderRadius: "999px",
            padding: "6px 14px",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#00FFFF" }} />
          <span
            style={{
              color: "#00FFFF",
              fontSize: "clamp(10px, 1.2vw, 12px)",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            The Ask
          </span>
        </div>

        <h2
          style={{
            color: "#00FFFF",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            margin: 0,
            textAlign: "center",
          }}
        >
          $500,000
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
          <p
            style={{
              color: "#00FFFF",
              fontSize: "clamp(1rem, 2vw, 1.4rem)",
              fontWeight: 600,
              margin: 0,
              textAlign: "center",
            }}
          >
            Pre-seed.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
              fontWeight: 400,
              margin: 0,
              textAlign: "center",
            }}
          >
            SAFE or convertible note.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "clamp(10px, 1.5vw, 16px)",
            width: "100%",
            maxWidth: "800px",
          }}
        >
          {[
            { number: "01", title: "Validate with real patients" },
            { number: "02", title: "First clinical partnerships" },
            { number: "03", title: "Regulatory approval" },
          ].map((item) => (
            <div
              key={item.number}
              style={{
                backgroundColor: "#0A0A0A",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "clamp(1.5rem, 3vw, 3rem) clamp(1rem, 2vw, 2.5rem)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <span
                style={{
                  color: "#00FFFF",
                  fontSize: "clamp(14px, 1.5vw, 18px)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textAlign: "center",
                }}
              >
                {item.number}
              </span>
              <h3
                style={{
                  color: "#FFFFFF",
                  fontSize: "clamp(0.95rem, 1.5vw, 1.3rem)",
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3,
                  textAlign: "center",
                }}
              >
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* CIERRE */}
      <section
        style={{
          backgroundColor: "#000000",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(2rem, 5vw, 5rem)",
          gap: "clamp(1.5rem, 3vw, 3rem)",
          position: "relative",
          zIndex: 30,
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <img
          src="/logo.png"
          alt="FixedGap"
          style={{
            height: "clamp(100px, 18vw, 220px)",
            width: "auto",
            objectFit: "contain",
          }}
        />

        <h2
          style={{
            color: "#FFFFFF",
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          FixedGap
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#FFFFFF",
              fontSize: "clamp(1.2rem, 2.8vw, 2.2rem)",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Recovery happens every day.
          </p>
          <p
            style={{
              color: "#00FFFF",
              fontSize: "clamp(1.2rem, 2.8vw, 2.2rem)",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Clinical insight should too.
          </p>
        </div>

        <button
          style={{
            backgroundColor: "#FFFFFF",
            color: "#000000",
            fontSize: "clamp(14px, 1.5vw, 18px)",
            fontWeight: 700,
            padding: "clamp(10px, 1.5vw, 16px) clamp(28px, 4vw, 48px)",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Watch demo
        </button>
      </section>

      {/* Pitch deck text overlays */}
      {loaded && snapFrames.map((snapFrame) => {
        // Skip frames that have custom overlays
        if (snapFrame === 1 || snapFrame === 95 || snapFrame === 225 || snapFrame === 350 || snapFrame === 483 || snapFrame === 616 || snapFrame === 720) {
          return (
            <div
              key={snapFrame}
              ref={(el) => {
                const idx = snapFrames.indexOf(snapFrame);
                if (idx !== -1) sectionRefs.current[idx] = el;
              }}
              style={{ display: "none" }}
            />
          );
        }

        const isDarkText = snapFrame >= 314;

        return (
          <div
            key={snapFrame}
            ref={(el) => {
              const idx = snapFrames.indexOf(snapFrame);
              if (idx !== -1) sectionRefs.current[idx] = el;
            }}
            style={{
              position: "fixed",
              top: "3rem",
              left: "3rem",
              opacity: 0,
              pointerEvents: "none",
              zIndex: 20,
              maxWidth: "600px",
            }}
          >
            <h1
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                textAlign: "left",
                color: isDarkText ? "#000000" : "#ffffff",
                margin: 0,
                lineHeight: 1.2,
                textShadow: isDarkText ? "none" : "0 2px 20px rgba(0, 0, 0, 0.5)",
              }}
            >
              {pitchTexts[snapFrame]}
            </h1>
          </div>
        );
      })}

      {/* PROBLEM section content - Frame 1 */}
      {loaded && (
        <div
          ref={problemContentRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingLeft: "4rem",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 10,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
            {sectionTitle("The Problem", "rgba(255,255,255,0.85)")}
            {/* Badge pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "2px solid rgba(255,255,255,0.35)",
                borderRadius: "999px",
                padding: "10px 24px",
                marginBottom: "2.5rem",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                2 seconds = 1 stroke
              </span>
            </div>

            {/* Numbers */}
            <div
              style={{
                display: "flex",
                gap: "3rem",
                alignItems: "flex-end",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#FFFFFF",
                    fontSize: "clamp(4.5rem, 8vw, 7.5rem)",
                    fontWeight: 900,
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    margin: 0,
                  }}
                >
                  12.2M
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "1.2rem",
                    fontWeight: 400,
                    marginTop: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  strokes every <span style={{ color: "#22d3ee", fontStyle: "italic" }}>year</span>
                </p>
              </div>

              <div>
                <p
                  style={{
                    color: "#FFFFFF",
                    fontSize: "clamp(4.5rem, 8vw, 7.5rem)",
                    fontWeight: 900,
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    margin: 0,
                  }}
                >
                  100M+
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "1.2rem",
                    fontWeight: 400,
                    marginTop: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  living with stroke <span style={{ color: "#22d3ee", fontStyle: "italic" }}>consequences</span>
                </p>
              </div>
            </div>
        </div>
      )}

      {/* PROBLEM 2 section content - Frame 95 */}
      {loaded && (
        <Problem2Overlay
          ref={problem2ContentRef}
          style={{ opacity: 0 }}
        />
      )}

      {/* WHAT IF - Frame 225 */}
      {loaded && (
        <div
          ref={whatIfRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingRight: "20vw",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 20,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              color: "#1e3a5f",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "600px",
              textAlign: "center",
            }}
          >
            What if there was a solution for this gap?
          </h2>
        </div>
      )}

      {/* SOLUTION - Frame 350 */}
      {loaded && (
        <div
          ref={solutionRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "5vw",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 20,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {sectionTitle("The Solution")}
          <div style={{ maxWidth: "540px" }}>
            {/* Main headline */}
            <p
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.3,
                margin: "0 0 2.5rem 0",
                letterSpacing: "-0.02em",
              }}
            >
              Software-only post-stroke recovery monitoring platform
            </p>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Step 1 - Patient */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                    Patient activity
                  </p>
                  <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
                    Patient completes a short rehab activity using only a regular webcam
                  </p>
                </div>
              </div>

              {/* Step 2 - Tracking */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                    Movement tracking
                  </p>
                  <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
                    Computer vision captures motor performance
                  </p>
                </div>
              </div>

              {/* Step 3 - Dashboard */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                    Clinical dashboard
                  </p>
                  <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
                    Clinicians receive objective recovery data
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* LAPTOP GAME - Frame 483 */}
      {loaded && (
        <div
          ref={laptopRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "5vw",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 20,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {sectionTitle("Clinical View")}
          <div style={{ maxWidth: "420px" }}>
            <p
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.3,
                margin: "0 0 1.5rem 0",
                letterSpacing: "-0.02em",
              }}
            >
              Clinical dashboard
            </p>

            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div
                style={{
                  width: "4px",
                  height: "100%",
                  minHeight: "40px",
                  borderRadius: "2px",
                  background: "#1e3a8a",
                  flexShrink: 0,
                }}
              />
              <p style={{ margin: 0, fontSize: "1.05rem", color: "#334155", lineHeight: 1.6 }}>
                Clinicians receive recovery data
              </p>
            </div>

            <div
              style={{
                background: "rgba(30, 58, 138, 0.06)",
                borderRadius: "12px",
                padding: "1rem 1.2rem",
                borderLeft: "3px solid #1e3a8a",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569", lineHeight: 1.5 }}>
                Not built to diagnose, built to give objective information between visits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD - Frame 616 */}
      {loaded && (
        <div
          ref={dashboardRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "3rem",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 20,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {sectionTitle("Expansion")}
          <p
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.3,
              margin: 0,
              marginTop: "42vh",
              letterSpacing: "-0.02em",
            }}
          >
            B2B SaaS
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", fontWeight: 700, color: "#0f172a" }}>
                Clinical Validation
              </p>
            </div>
            <span style={{ fontSize: "1.8rem", color: "#1e3a8a", fontWeight: 700 }}>→</span>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", fontWeight: 700, color: "#0f172a" }}>
                Commercial Adoption
              </p>
            </div>
            <span style={{ fontSize: "1.8rem", color: "#1e3a8a", fontWeight: 700 }}>→</span>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", fontWeight: 700, color: "#0f172a" }}>
                Scale
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TRACTION - Frame 720 */}
      {loaded && (
        <div
          ref={tractionRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "3rem",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 30,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          <p
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 700,
              color: "#000000",
              lineHeight: 1.3,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            From Idea to Clinical Validation
          </p>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 700,
                color: "#000000",
                margin: "0 0 1rem 0",
                letterSpacing: "-0.02em",
              }}
            >
              5+ strategic supporters
            </p>
            <p
              style={{
                fontSize: "clamp(0.95rem, 1.6vw, 1.2rem)",
                color: "#000000",
                margin: 0,
                lineHeight: 1.8,
                fontWeight: 500,
              }}
            >
              AWS Spain &middot; Saturno Labs &middot; Bosch &middot; RCC Harvard &middot; Hospital Gregorio Mara&ntilde;&oacute;n &middot; Hospital La Paz &middot; and others
            </p>
          </div>
        </div>
      )}
    </>
  );
}
