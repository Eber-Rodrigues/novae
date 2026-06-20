import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { label: "About Us", href: "#novae" },
  { label: "Projects", href: "#projects" },
  { label: "Team", href: "#team" },
  { label: "Newsletter", href: "#newsletter" },
  { label: "Knowledge Base", href: "#knowledge-base" },
];

// ─── DESIGN CANVAS ──────────────────────────────────────────────
// All positions/sizes below are authored against this fixed canvas.
// A JS scale factor (fit-by-height) is applied to the wrapper so
// every device renders identically, just scaled.
const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const TABLET_WIDTH = 820;
const TABLET_HEIGHT = 1180;

// ─── STATIC CARDS — all values in px, against the 390x844 canvas ───
const STATIC_CARDS = [
  { id: "novae", image: "images/novae.png", top: 265, left: 195, width: 260, rotate: 15, z: 10 },
  { id: "newsletter", image: "images/newsletter.png", top: 110, left: 90, width: 170, rotate: -20, z: 5 },
  { id: "team", image: "images/team4.png", top: 120, left: 300, width: 120, rotate: 15, z: 5 },
  { id: "knowledge-base", image: "images/folder.png", top: 550, left: 260, width: 200, rotate: 20, z: 5 },
  { id: "projects", image: "images/notebook.png", top: 510, left: 110, width: 220, rotate: -10, z: 5 },
  { id: "current-project", image: "images/note5.png", top: 185, left: 82, width: 80, rotate: -20, z: 5 },
  { id: "pencil", image: "images/pencil.png", top: 400, left: 320, width: 200, rotate: -40, z: 5 },
  { id: "paper-clips", image: "images/paper_clips.png", top: 360, left: 80, width: 130, rotate: -8, z: 5 },
];

function StaticCard({ card, delay }: { card: typeof STATIC_CARDS[number]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: card.rotate, x: "-50%", y: "-50%" }}
      animate={{ opacity: 1, scale: 1, rotate: card.rotate, x: "-50%", y: "-50%" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        top: card.top,
        left: card.left,
        zIndex: card.z,
        width: card.width,
        pointerEvents: "none",
      }}
    >

      <img
        src={card.image}
        alt=""
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(-8px 14px 9px rgba(15,12,8,0.55)) drop-shadow(-2px 4px 3px rgba(15,12,8,0.35))",
        }}
      />
    </motion.div>
  );
}

export default function MobileHero({ deviceLayout }: { deviceLayout?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isTabletPortrait = deviceLayout === "tablet";
  const DESIGN_WIDTH = isTabletPortrait ? TABLET_WIDTH : PHONE_WIDTH;
  const DESIGN_HEIGHT = isTabletPortrait ? TABLET_HEIGHT : PHONE_HEIGHT;
  const CANVAS_SCALE = DESIGN_WIDTH / PHONE_WIDTH;

  // ─── Fit-by-height scaling ───
  useEffect(() => {
    const applyScale = () => {
      const root = rootRef.current;
      if (!root) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const scale = screenH / DESIGN_HEIGHT;
      const scaledWidth = DESIGN_WIDTH * scale;

      root.style.width = `${DESIGN_WIDTH}px`;
      root.style.height = `${DESIGN_HEIGHT}px`;
      root.style.transform = `scale(${scale})`;
      root.style.transformOrigin = "top left";
      root.style.position = "absolute";
      root.style.top = "0px";
      root.style.left = `${(screenW - scaledWidth) / 2}px`;
    };

    applyScale();
    window.addEventListener("resize", applyScale);
    window.addEventListener("orientationchange", () => setTimeout(applyScale, 150));
    return () => {
      window.removeEventListener("resize", applyScale);
      window.removeEventListener("orientationchange", applyScale);
    };
  }, [deviceLayout]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#080808" }}>
      <div ref={rootRef}>
        <section
          style={{
            position: "relative",
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            overflow: "hidden",
            background: "#080808",
          }}
        >
          {/* Cropped background */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('images/background2.png')",
            backgroundSize: "340% auto",
            backgroundPosition: "46% 32%",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }} />

          

          {/* Noise grain */}
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
            pointerEvents: "none",
          }} />

          {/* Logo */}
          <motion.img
            src="images/logo.png"
            alt="NOVAe"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: 3 * CANVAS_SCALE,
              left: 64 * CANVAS_SCALE,
              zIndex: 30,
              width: 40 * CANVAS_SCALE,
              height: "auto",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* Slogan image below logo */}
          <motion.img
            src="images/logo_slogan.png"
            alt="BUILD SOMETHING"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: -90 * CANVAS_SCALE,
              left: 40 * CANVAS_SCALE,
              zIndex: 30,
              width: 250 * CANVAS_SCALE,
              height: "auto",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* Hamburger menu */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{
              position: "absolute",
              top: 2 * CANVAS_SCALE,
              right: 58 * CANVAS_SCALE,
              zIndex: 100,
              width: 42 * CANVAS_SCALE,
              height: 42 * CANVAS_SCALE,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6 * CANVAS_SCALE,
              background: "transparent",
              border: "none",
            }}
          >
            <span style={{ width: 28 * CANVAS_SCALE, height: 2 * CANVAS_SCALE, background: "#B8D10D" }} />
            <span style={{ width: 28 * CANVAS_SCALE, height: 2 * CANVAS_SCALE, background: "#B8D10D" }} />
            <span style={{ width: 28 * CANVAS_SCALE, height: 2 * CANVAS_SCALE, background: "#B8D10D" }} />
          </button>

          {/* Mobile nav overlay */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 200,
                  background: "rgba(4,4,4,0.97)",
                  backdropFilter: "blur(20px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 30,
                }}
              >
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    width: 42,
                    height: 42,
                    background: "rgba(255,255,255,0.08)",
                    border: "0.5px solid rgba(255,255,255,0.14)",
                    borderRadius: 10,
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>

                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "17px",
                      fontWeight: 400,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.85)",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* All static cards (no hover, shadow only) */}
          {STATIC_CARDS.map((card, i) => (
            <StaticCard
              key={card.id}
              card={{
                ...card,
                top: card.top * CANVAS_SCALE,
                left: card.left * CANVAS_SCALE,
                width: card.width * CANVAS_SCALE,
              }}
              delay={0.6 + i * 0.1}
            />
          ))}

          {/* Frosted glass text box */}
          <motion.div
            className="glass-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: 400 * CANVAS_SCALE,
              left: 90 * CANVAS_SCALE,
              transform: "translateX(-50%)",
              zIndex: 20,
              width: 200 * CANVAS_SCALE,
              backdropFilter: "blur(28px) saturate(1.6) brightness(1.08)",
              WebkitBackdropFilter: "blur(28px) saturate(1.6) brightness(1.08)",
              background: "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)",
              border: "0.5px solid rgba(255,255,255,0.20)",
              borderRadius: 20,
              padding: "24px 18px",
              minHeight: 55 * CANVAS_SCALE,
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "row",
              gap: 14,
              boxShadow: "0 24px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Event CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "9px",
                fontWeight: 400,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.40)",
                margin: 0,
              }}>
                Upcoming Event
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.08)",
                  border: "0.5px solid rgba(255,255,255,0.14)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <img
                    src="images/logoazul.png"
                    alt="Event"
                    style={{ width: 20, height: 20, objectFit: "contain" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.80)",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    FORGE Hackaton
                  </p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "10px",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.40)",
                    margin: 0,
                  }}>
                    November
                  </p>
                </div>
              </div>

              <a
                href="#event"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "7px 0",
                  borderRadius: 24,
                  background: "rgba(204,255,0,0.08)",
                  border: "0.5px solid rgba(204,255,0,0.25)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#ccff00",
                  textDecoration: "none",
                }}
              >
                Register
              </a>
            </div>

            {/* Divider */}
            <div style={{
              width: "0.5px",
              alignSelf: "stretch",
              borderLeft: "0.5px dashed rgba(255,255,255,0.18)",
            }} />

            {/* Newsletter CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "9px",
                fontWeight: 400,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.40)",
                margin: 0,
              }}>
                Newsletter
              </p>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 300,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.55)",
                margin: 0,
              }}>
                Stay up to date with NOVAe.
              </p>

              <a
                href="#newsletter"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "7px 0",
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.07)",
                  border: "0.5px solid rgba(255,255,255,0.16)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.78)",
                  textDecoration: "none",
                }}
              >
                Subscribe
              </a>
            </div>
          </motion.div>

          {/* Scroll Down indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: 20 * CANVAS_SCALE,
              left: 195 * CANVAS_SCALE,
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              pointerEvents: "none",
            }}
          >
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}>
              Scroll Down
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L8 11L13 6" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}