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
  const [askAmount, setAskAmount] = useState(0);
  const [hasAnimatedAsk, setHasAnimatedAsk] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [hasAnimatedTypewriter, setHasAnimatedTypewriter] = useState(false);

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

  // Typewriter effect for "What if" section (letter by letter)
  useEffect(() => {
    const handleScroll = () => {
      if (hasAnimatedTypewriter) return;

      const SCROLL_CONTAINER_HEIGHT = 30471;
      const whatIfFrame = 225;
      const whatIfScrollPos = (whatIfFrame / (TOTAL_FRAMES - 1)) * SCROLL_CONTAINER_HEIGHT;

      const scrollY = window.scrollY;

      // Check if we're near the What If frame
      if (Math.abs(scrollY - whatIfScrollPos) < window.innerHeight * 0.3) {
        setHasAnimatedTypewriter(true);

        const fullText = "What if there was a solution for this gap?";
        let currentIndex = 0;

        const typeNextChar = () => {
          if (currentIndex <= fullText.length) {
            setTypewriterText(fullText.slice(0, currentIndex));
            currentIndex++;

            // Variable speed for more realistic typing (faster for regular chars, slower for spaces and punctuation)
            const char = fullText[currentIndex - 1];
            let delay = 40; // Base speed

            if (char === ' ') {
              delay = 80; // Pause at spaces
            } else if (char === '?' || char === '.' || char === ',') {
              delay = 200; // Longer pause at punctuation
            } else {
              // Add slight randomness for human-like typing
              delay = 40 + Math.random() * 40; // 40-80ms
            }

            setTimeout(typeNextChar, delay);
          }
        };

        typeNextChar();
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimatedTypewriter]);

  // Animated counter for The Ask section
  useEffect(() => {
    const handleScroll = () => {
      if (hasAnimatedAsk) return;

      const SCROLL_CONTAINER_HEIGHT = 30471;
      const teamSectionHeight = window.innerHeight; // TEAM section
      const ASK_SECTION_START = SCROLL_CONTAINER_HEIGHT + teamSectionHeight + 200;

      const scrollY = window.scrollY;

      // Check if we've scrolled into The Ask section
      if (scrollY >= ASK_SECTION_START - window.innerHeight * 0.6) {
        setHasAnimatedAsk(true);

        // Animate counter from 0 to 500000
        const duration = 1800; // 1.8 seconds
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function for smooth deceleration (ease-out cubic)
          const easeOut = 1 - Math.pow(1 - progress, 4);
          const current = Math.floor(easeOut * 500000);

          setAskAmount(current);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setAskAmount(500000); // Ensure we end exactly at 500000
          }
        };

        animate();
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately in case already scrolled

    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimatedAsk]);

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
          background: "linear-gradient(180deg, #FFFFFF 0%, #f8fafc 100%)",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(2rem, 5vw, 5rem)",
          gap: "clamp(2rem, 4vw, 3rem)",
          position: "relative",
          zIndex: 30,
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(30, 58, 138, 0.08) 100%)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(6, 182, 212, 0.3)",
            borderRadius: "999px",
            padding: "10px 20px",
            boxShadow: "0 4px 16px rgba(6, 182, 212, 0.15)",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #06b6d4 0%, #1e3a8a 100%)",
              boxShadow: "0 0 12px rgba(6, 182, 212, 0.5)",
            }}
          />
          <span
            style={{
              background: "linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "clamp(12px, 1.3vw, 15px)",
              fontWeight: 800,
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
            maxWidth: "950px",
            height: "clamp(220px, 38vh, 420px)",
            borderRadius: "24px",
            overflow: "hidden",
            border: "3px solid rgba(30, 58, 138, 0.12)",
            boxShadow: "0 20px 60px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)",
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
            maxWidth: "950px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(1.5rem, 2.5vw, 2rem)",
          }}
        >
          <div style={{ display: "flex", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { highlight: "Software", normal: "engineering" },
              { highlight: "Biomedical", normal: "engineering" },
              { highlight: "Active", normal: "physician" }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.8) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(30, 58, 138, 0.1)",
                  borderRadius: "16px",
                  padding: "12px 24px",
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
                }}
              >
                <p style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", fontWeight: 800, margin: 0, whiteSpace: "nowrap" }}>
                  <span style={{
                    background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>{item.highlight || item.normal}</span>
                  {item.highlight && item.normal && " "}
                  {item.highlight && <span style={{ color: "#0f172a" }}>{item.normal}</span>}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "16px 28px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.8) 100%)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: "2px solid rgba(30, 58, 138, 0.1)",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
            }}
          >
            <img src="/spain.png" alt="Spain" style={{ height: "clamp(24px, 3vw, 36px)", width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
            <img src="/usa.png" alt="USA" style={{ height: "clamp(24px, 3vw, 36px)", width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
            <img src="/HSIL.png" alt="Harvard HSIL" style={{ height: "clamp(24px, 3vw, 36px)", width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
          </div>
        </div>
      </section>

      {/* THE ASK */}
      <section
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #FFFFFF 50%, #f0f9ff 100%)",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(3rem, 6vw, 6rem)",
          gap: "clamp(2rem, 4vw, 4rem)",
          position: "relative",
          zIndex: 30,
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(30, 58, 138, 0.08) 100%)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(6, 182, 212, 0.3)",
            borderRadius: "999px",
            padding: "10px 20px",
            boxShadow: "0 4px 16px rgba(6, 182, 212, 0.15)",
          }}
        >
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #06b6d4 0%, #1e3a8a 100%)",
            boxShadow: "0 0 12px rgba(6, 182, 212, 0.5)",
          }} />
          <span
            style={{
              background: "linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "clamp(11px, 1.3vw, 14px)",
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            The Ask
          </span>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.9) 100%)",
            backdropFilter: "blur(20px)",
            borderRadius: "32px",
            padding: "clamp(2rem, 4vw, 3.5rem) clamp(2.5rem, 5vw, 4rem)",
            border: "3px solid rgba(30, 58, 138, 0.15)",
            boxShadow: "0 24px 72px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative top border */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #06b6d4 0%, #1e3a8a 50%, #06b6d4 100%)",
            }}
          />

          <h2
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "clamp(3.5rem, 9vw, 7rem)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              margin: "0 0 1.5rem 0",
              textAlign: "center",
              transition: "transform 0.1s ease",
            }}
          >
            ${askAmount.toLocaleString()}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", marginBottom: "2rem" }}>
            <p
              style={{
                background: "linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)",
                fontWeight: 800,
                margin: 0,
                textAlign: "center",
              }}
            >
              Pre-seed.
            </p>
            <p
              style={{
                color: "#475569",
                fontSize: "clamp(0.95rem, 1.6vw, 1.2rem)",
                fontWeight: 600,
                margin: 0,
                textAlign: "center",
              }}
            >
              SAFE or convertible note.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "clamp(16px, 2vw, 24px)",
            width: "100%",
            maxWidth: "950px",
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
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.85) 100%)",
                backdropFilter: "blur(15px)",
                border: "2px solid rgba(30, 58, 138, 0.15)",
                borderRadius: "24px",
                padding: "clamp(2rem, 3.5vw, 3.5rem) clamp(1.5rem, 2.5vw, 3rem)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxShadow: "0 8px 32px rgba(15, 23, 42, 0.1)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 16px 48px rgba(6, 182, 212, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(15, 23, 42, 0.1)";
              }}
            >
              {/* Decorative corner accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, transparent 100%)",
                  borderRadius: "0 0 0 100%",
                }}
              />
              <span
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontSize: "clamp(16px, 1.8vw, 22px)",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textAlign: "center",
                }}
              >
                {item.number}
              </span>
              <h3
                style={{
                  color: "#0f172a",
                  fontSize: "clamp(1.05rem, 1.7vw, 1.45rem)",
                  fontWeight: 800,
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
          background: "linear-gradient(180deg, #f0f9ff 0%, #FFFFFF 50%, #f8fafc 100%)",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(3rem, 6vw, 6rem)",
          gap: "clamp(2rem, 4vw, 3.5rem)",
          position: "relative",
          zIndex: 30,
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.85) 100%)",
            backdropFilter: "blur(20px)",
            borderRadius: "32px",
            padding: "clamp(2rem, 4vw, 3rem)",
            border: "3px solid rgba(30, 58, 138, 0.12)",
            boxShadow: "0 20px 60px rgba(15, 23, 42, 0.1)",
          }}
        >
          <img
            src="/fix.png"
            alt="FixedGap"
            style={{
              height: "clamp(120px, 20vw, 260px)",
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 4px 12px rgba(15, 23, 42, 0.15))",
            }}
          />
        </div>

        <h2
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 80%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "-0.04em",
          }}
        >
          FixedGap
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          <p
            style={{
              color: "#0f172a",
              fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
            }}
          >
            Recovery happens every day.
          </p>
          <p
            style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 50%, #1e3a8a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
            }}
          >
            Clinical insight should too.
          </p>
        </div>

        <a
          href="https://www.youtube.com/watch?v=qyoTG4PWM8c"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
          }}
        >
          <button
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 80%, #0e7490 100%)",
              color: "#FFFFFF",
              fontSize: "clamp(16px, 1.8vw, 22px)",
              fontWeight: 800,
              padding: "clamp(14px, 2vw, 22px) clamp(40px, 6vw, 72px)",
              borderRadius: "16px",
              border: "3px solid rgba(6, 182, 212, 0.3)",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              boxShadow: "0 8px 32px rgba(30, 58, 138, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(6, 182, 212, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(30, 58, 138, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)";
            }}
          >
            Watch demo
          </button>
        </a>
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
            {sectionTitle("The Problem", "rgba(255,255,255,0.95)")}
            {/* Badge pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 116, 144, 0.12) 100%)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(6, 182, 212, 0.4)",
                borderRadius: "999px",
                padding: "12px 28px",
                marginBottom: "2.5rem",
                boxShadow: "0 4px 16px rgba(6, 182, 212, 0.2), 0 0 32px rgba(6, 182, 212, 0.1)",
              }}
            >
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                }}
              >
                2 seconds = 1 stroke
              </span>
            </div>

            {/* Numbers */}
            <div
              style={{
                display: "flex",
                gap: "4rem",
                alignItems: "flex-end",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#FFFFFF",
                    fontSize: "clamp(4.8rem, 9vw, 8rem)",
                    fontWeight: 900,
                    lineHeight: 0.9,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    textShadow: "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 48px rgba(6, 182, 212, 0.2)",
                  }}
                >
                  12.2M
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "1.3rem",
                    fontWeight: 500,
                    marginTop: "0.85rem",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  strokes every <span style={{
                    color: "#06b6d4",
                    fontWeight: 700,
                    textShadow: "0 0 16px rgba(6, 182, 212, 0.6)",
                  }}>year</span>
                </p>
              </div>

              <div>
                <p
                  style={{
                    color: "#FFFFFF",
                    fontSize: "clamp(4.8rem, 9vw, 8rem)",
                    fontWeight: 900,
                    lineHeight: 0.9,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    textShadow: "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 48px rgba(6, 182, 212, 0.2)",
                  }}
                >
                  100M+
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "1.3rem",
                    fontWeight: 500,
                    marginTop: "0.85rem",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  living with stroke <span style={{
                    color: "#06b6d4",
                    fontWeight: 700,
                    textShadow: "0 0 16px rgba(6, 182, 212, 0.6)",
                  }}>consequences</span>
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
          <div style={{ position: "relative", maxWidth: "650px" }}>
            <h2
              style={{
                fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)",
                fontWeight: 900,
                background: "linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 50%, #0e7490 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.04em",
                lineHeight: 1.15,
                margin: 0,
                textAlign: "center",
                minHeight: "2.3em",
                position: "relative",
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              {typewriterText}
              {typewriterText && typewriterText.length < "What if there was a solution for this gap?".length && (
                <span
                  className="typewriter-cursor"
                  style={{
                    display: "inline-block",
                    width: "3px",
                    height: "0.9em",
                    background: "linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 50%, #0e7490 100%)",
                    marginLeft: "4px",
                    animation: "blink 0.7s step-end infinite",
                    verticalAlign: "middle",
                  }}
                />
              )}
            </h2>
            <style jsx>{`
              @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
              }
            `}</style>
          </div>
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
          <div style={{ maxWidth: "560px" }}>
            {/* Main headline */}
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 800,
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.15,
                margin: "0 0 1.2rem 0",
                letterSpacing: "-0.04em",
              }}
            >
              Software-only recovery monitoring from home
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(1.05rem, 1.9vw, 1.35rem)",
                fontWeight: 600,
                color: "#334155",
                lineHeight: 1.4,
                margin: "0 0 2.8rem 0",
                letterSpacing: "-0.01em",
              }}
            >
              Short webcam tasks become objective movement data.
            </p>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { num: 1, title: "Home session", desc: "Patient completes a short task" },
                { num: 2, title: "Computer vision", desc: "Movement is captured automatically" },
                { num: 3, title: "Clinical dashboard", desc: "Clinicians see trends between visits" }
              ].map((step) => (
                <div key={step.num} style={{ display: "flex", gap: "1.1rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1e3a8a 0%, #0e7490 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: "0 4px 16px rgba(30, 58, 138, 0.25), 0 0 24px rgba(6, 182, 212, 0.15)",
                    }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {step.title}
                    </p>
                    <p style={{
                      margin: "0.4rem 0 0 0",
                      fontSize: "0.95rem",
                      color: "#475569",
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div
              style={{
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "2px solid transparent",
                borderImage: "linear-gradient(90deg, rgba(6, 182, 212, 0.3) 0%, rgba(30, 58, 138, 0.15) 100%) 1",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "#64748b",
                  lineHeight: 1.6,
                  fontWeight: 600,
                  letterSpacing: "0.005em",
                }}
              >
                No wearables. No specialized hardware. Monitoring support, not diagnosis.
              </p>
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
          <div style={{ maxWidth: "540px" }}>
            {/* Main headline with gradient */}
            <h2
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
                fontWeight: 800,
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
                margin: "0 0 1.2rem 0",
                letterSpacing: "-0.04em",
              }}
            >
              Clinical dashboard
            </h2>

            {/* Subtitle with better color */}
            <p
              style={{
                fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                fontWeight: 600,
                color: "#334155",
                lineHeight: 1.4,
                margin: "0 0 2.8rem 0",
                letterSpacing: "-0.01em",
              }}
            >
              Prioritize follow-up. Monitor more patients. No extra workload.
            </p>

            {/* Floating chips with gradient backgrounds */}
            <div
              style={{
                display: "flex",
                gap: "0.85rem",
                marginBottom: "2.5rem",
                flexWrap: "wrap",
              }}
            >
              {["Prioritize follow-up", "Monitor more patients", "No extra workload"].map((label, idx) => (
                <div
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    background: `linear-gradient(135deg, rgba(6, 182, 212, ${0.12 - idx * 0.02}) 0%, rgba(14, 116, 144, ${0.08 - idx * 0.01}) 100%)`,
                    border: "1.5px solid rgba(6, 182, 212, 0.25)",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    boxShadow: "0 2px 8px rgba(6, 182, 212, 0.1)",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
                      boxShadow: "0 0 8px rgba(6, 182, 212, 0.4)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#0c4a6e",
                      letterSpacing: "0.005em",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Note card with premium glassmorphism */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.75) 100%)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "1.5rem 1.75rem",
                border: "1.5px solid rgba(30, 58, 138, 0.12)",
                boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(6, 182, 212, 0.06)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, #06b6d4 0%, #1e3a8a 100%)",
                  opacity: 0.6,
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  color: "#475569",
                  lineHeight: 1.7,
                  fontWeight: 500,
                }}
              >
                <strong style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 800,
                }}>
                  Not built to diagnose or replace clinical judgment.
                </strong>
                <br />
                Built to give clinicians objective information between visits.
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
            alignItems: "center",
            padding: "3rem",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 20,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {sectionTitle("Expansion")}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            width: "100%",
            maxWidth: "1200px",
          }}>
            {["Clinical Validation", "Commercial Adoption", "Scale"].map((stage, idx, arr) => (
              <div key={stage} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                <div
                  style={{
                    textAlign: "center",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.75) 100%)",
                    backdropFilter: "blur(15px)",
                    padding: "1.2rem 2rem",
                    borderRadius: "16px",
                    border: "2px solid rgba(30, 58, 138, 0.15)",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.1)",
                  }}
                >
                  <p style={{
                    margin: 0,
                    fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                  }}>
                    {stage}
                  </p>
                </div>
                {idx < arr.length - 1 && (
                  <span style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #06b6d4 0%, #1e3a8a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>→</span>
                )}
              </div>
            ))}
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
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 800,
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            From Idea to Clinical Validation
          </h2>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(30, 58, 138, 0.08) 100%)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(6, 182, 212, 0.25)",
                borderRadius: "999px",
                padding: "12px 28px",
                marginBottom: "1.5rem",
                boxShadow: "0 4px 20px rgba(6, 182, 212, 0.15)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #06b6d4 0%, #1e3a8a 100%)",
                  boxShadow: "0 0 12px rgba(6, 182, 212, 0.6)",
                }}
              />
              <p
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                  letterSpacing: "-0.03em",
                }}
              >
                5+ strategic supporters
              </p>
            </div>
            <p
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
                color: "#334155",
                margin: 0,
                lineHeight: 1.9,
                fontWeight: 600,
                letterSpacing: "0.01em",
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
