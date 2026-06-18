import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { LoadingOverlay } from "./LoadingOverlay";
import { EntryScreen } from "./EntryScreen";
import { UnsupportedScreen } from "./UnsupportedScreen";

type DeviceLayout = "desktop" | "tablet";

type CardPosition = { top?: string; bottom?: string; left?: string; right?: string };
type CardSize = { w: number; h: number };

type FloatingCardLayout = {
  position: CardPosition;
  rotation: number;
  size: CardSize;
  labelOffset?: number;
};

interface FloatingCardConfig {
  id: string;
  label: string;
  image: string;
  link: string;
  zIndex: number;
  labelPosition?: "top" | "bottom";
  labelAlign?: "left";
  layouts: Record<DeviceLayout, FloatingCardLayout>;
}

type ResolvedFloatingCardConfig = Omit<FloatingCardConfig, "layouts"> & FloatingCardLayout;

interface RepelCardLayout {
  position: CardPosition;
  rotation: number;
  size: CardSize;
}

interface RepelCardConfig {
  id: string;
  image: string;
  zIndex: number;
  layouts: Record<DeviceLayout, RepelCardLayout>;
}

type ResolvedRepelCardConfig = Omit<RepelCardConfig, "layouts"> & RepelCardLayout;

const TABLET_MIN_WIDTH = 768;
const DESKTOP_MIN_WIDTH = 1024;

const resolveFloatingCardLayout = (
  card: FloatingCardConfig,
  deviceLayout: DeviceLayout,
): ResolvedFloatingCardConfig => ({
  id: card.id,
  label: card.label,
  image: card.image,
  link: card.link,
  zIndex: card.zIndex,
  labelPosition: card.labelPosition,
  labelAlign: card.labelAlign,
  ...card.layouts[deviceLayout],
});

const resolveRepelCardLayout = (
  card: RepelCardConfig,
  deviceLayout: DeviceLayout,
): ResolvedRepelCardConfig => ({
  id: card.id,
  image: card.image,
  zIndex: card.zIndex,
  ...card.layouts[deviceLayout],
});

const CARDS_CONFIG: FloatingCardConfig[] = [
  {
    id: "c1",
    label: "Partnerships",
    image: "images/cards3.png",
    link: "#partnerships",
    zIndex: 3,
    labelPosition: "top",
    layouts: {
      desktop: {
        position: { top: "65%", left: "35%" },
        rotation: 5,
        size: { w: 390, h: 200 },
        labelOffset: 30,
      },
      tablet: {
        position: { top: "63%", left: "30%" },
        rotation: 3,
        size: { w: 320, h: 170 },
        labelOffset: 24,
      },
    },
  },
  {
    id: "c2",
    label: "NOVAe",
    image: "images/novae.png",
    link: "#novae",
    zIndex: 2,
    labelPosition: "top",
    layouts: {
      desktop: {
        position: { top: "14%", left: "33%" },
        rotation: 15,
        size: { w: 440, h: 350 },
        labelOffset: 30,
      },
      tablet: {
        position: { top: "16%", left: "26%" },
        rotation: 10,
        size: { w: 360, h: 290 },
        labelOffset: 22,
      },
    },
  },
  {
    id: "c3",
    label: "Newsletter",
    image: "images/newsletter.png",
    link: "#newsletter",
    zIndex: 4,
    labelPosition: "bottom",
    layouts: {
      desktop: {
        position: { top: "10%", right: "58%" },
        rotation: -20,
        size: { w: 690, h: 290 },
        labelOffset: 70,
      },
      tablet: {
        position: { top: "18%", right: "55%" },
        rotation: -13,
        size: { w: 530, h: 230 },
        labelOffset: 56,
      },
    },
  },
  {
    id: "c5",
    label: "Meet the Team",
    image: "images/team4.png",
    link: "#team",
    zIndex: 3,
    labelPosition: "bottom",
    layouts: {
      desktop: {
        position: { bottom: "38%", left: "74%" },
        rotation: 10,
        size: { w: 360, h: 270 },
        labelOffset: 15,
      },
      tablet: {
        position: { bottom: "42%", left: "67%" },
        rotation: 7,
        size: { w: 300, h: 220 },
        labelOffset: 12,
      },
    },
  },
  {
    id: "c6",
    label: "Knowledge Base",
    image: "images/folder.png",
    link: "#knowledge-base",
    zIndex: 2,
    labelPosition: "bottom",
    labelAlign: "left",
    layouts: {
      desktop: {
        position: { bottom: "-14%", right: "-2%" },
        rotation: 20,
        size: { w: 300, h: 300 },
        labelOffset: 220,
      },
      tablet: {
        position: { bottom: "-8%", right: "0%" },
        rotation: 14,
        size: { w: 250, h: 250 },
        labelOffset: 176,
      },
    },
  },
  {
    id: "c4",
    label: "Projects",
    image: "images/notebook.png",
    link: "#projects",
    zIndex: 2,
    labelPosition: "top",
    layouts: {
      desktop: {
        position: { bottom: "-16%", right: "15%" },
        rotation: -7,
        size: { w: 300, h: 380 },
        labelOffset: 40,
      },
      tablet: {
        position: { bottom: "-12%", right: "12%" },
        rotation: -5,
        size: { w: 255, h: 320 },
        labelOffset: 30,
      },
    },
  },
  {
    id: "c7",
    label: "Current Project",
    image: "images/note5.png",
    link: "#current-project",
    zIndex: 2,
    labelPosition: "bottom",
    layouts: {
      desktop: {
        position: { bottom: "57%", right: "25%" },
        rotation: 10,
        size: { w: 195, h: 195 },
        labelOffset: 6,
      },
      tablet: {
        position: { bottom: "55%", right: "23%" },
        rotation: 7,
        size: { w: 165, h: 165 },
        labelOffset: 6,
      },
    },
  },
];
 
 
const NAV_LINKS = [
  { label: "About Us", href: "#novae" },
  { label: "Projects", href: "#projects" },
  { label: "Team", href: "#team" },
  { label: "Newsletter", href: "#newsletter" },
  { label: "Knowledge Base", href: "#knowledge-base" },
];

function NavLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: hovered ? "#B8D10D" : "rgba(255,255,255,0.55)",
        transition: "color 0.22s ease",
        textDecoration: "none",
        paddingBottom: 4,
      }}
    >
      {label}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "#ccff00",
          transformOrigin: "left",
        }}
      />
    </a>
  );
}

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      style={{
        position: "fixed",
        top: 24,
        right: 32,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 16,
        pointerEvents: "auto",
      }}
    >
      {NAV_LINKS.map((link) => (
        <NavLink key={link.href} label={link.label} href={link.href} />
      ))}
    </motion.nav>
  );
}
 
 
function FloatingCard({ card, index }: { card: ResolvedFloatingCardConfig; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const positionStyle = {
    position: "absolute",
    width: card.size.w,
    height: card.size.h,
    zIndex: isHovered ? 50 : card.zIndex,
    ...card.position,
  };
 
  const baseRotate = card.rotation;
  const hoverRotateShift = card.rotation > 0 ? -1.2 : 1.2;
 
  return (
    
    <motion.a
      href={card.link}
      style={{ ...positionStyle, pointerEvents: "none" }}
      initial={{ opacity: 0, y: 30, rotate: baseRotate }}
      animate={{ opacity: 1, y: 0, rotate: baseRotate }}
     transition={{
  opacity: { duration: 0.8, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] },
  y: { duration: 0.2, ease: "easeOut" },
  x: { duration: 0.2, ease: "easeOut" },
  scale: { duration: 0.2, ease: "easeOut" },
  rotate: { duration: 0.2, ease: "easeOut" },
}}
      whileHover={{
        y: -14,
        x: card.rotation > 0 ? 5 : -5,
        scale: 1.03,
        rotate: baseRotate + hoverRotateShift,
        zIndex: 50,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {/* Card body */}
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "pointer",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Background image */}
<img
  src={card.image}
  alt={card.label}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onClick={() => { window.location.href = card.link }}
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    pointerEvents: "auto",
    filter: isHovered
      ? "drop-shadow(-5px 6px 8px rgba(15,12,8,0.40)) drop-shadow(-2px 3px 3px rgba(15,12,8,0.28))"
      : "drop-shadow(-8px 14px 9px rgba(15,12,8,0.55)) drop-shadow(-2px 4px 3px rgba(15,12,8,0.35))",
    transition: "filter 0.4s ease",
  }}
  
/>
 
      </motion.div>
 
      {/* Floating label */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.94 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: "absolute",
                ...(card.labelPosition === "top"
                  ? { top: (card.labelOffset ?? 12), bottom: "auto" }
                  : { bottom: (card.labelOffset ?? 12), top: "auto" }),
                left: card.labelAlign === "left" ? "0%" : "50%",
                transform: card.labelAlign === "left" ? "translateX(0%)" : "translateX(-50%)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                zIndex: 60,
            }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 24,
              backdropFilter: "blur(20px) saturate(1.6)",
              WebkitBackdropFilter: "blur(20px) saturate(1.6)",
              background: "rgba(255,255,255,0.09)",
              border: "0.5px solid rgba(255,255,255,0.16)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              <div style={{
                width: 5, height: 5,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.65)",
              }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.78)",
                textTransform: "uppercase",
              }}>
                {card.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
}

const REPEL_CARDS_CONFIG: RepelCardConfig[] = [
  {
    id: "r1",
    image: "images/pencil.png",
    zIndex: 5,
    layouts: {
      desktop: {
        position: { top: "35%", left: "4%" },
        rotation: 60,
        size: { w: 400, h: 400 },
      },
      tablet: {
        position: { top: "38%", left: "-3%" },
        rotation: 48,
        size: { w: 300, h: 300 },
      },
    },
  },
  {
    id: "r2",
    image: "images/paper_clips.png",
    zIndex: 5,
    layouts: {
      desktop: {
        position: { top: "70%", left: "20%" },
        rotation: -8,
        size: { w: 180, h: 180 },
      },
      tablet: {
        position: { top: "70%", left: "16%" },
        rotation: -5,
        size: { w: 150, h: 150 },
      },
    },
  },
];

function RepelCard({ card }: { card: ResolvedRepelCardConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = centerX - e.clientX;
    const dy = centerY - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const strength = 18;
    const moveX = (dx / dist) * strength;
    const moveY = (dy / dist) * strength;

    setOffset({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        width: card.size.w,
        height: card.size.h,
        zIndex: card.zIndex,
        rotate: `${card.rotation}deg`,
        ...card.position,
        pointerEvents: "auto",
      }}
    >
      <img
        src={card.image}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          filter: "drop-shadow(-7px 8px 10px rgba(0,0,0,0.65)) drop-shadow(-3px 3px 4px rgba(0,0,0,0.40))",
        }}
      />
    </motion.div>
  );
}
 
export function HeroSection({ deviceLayout }: { deviceLayout: DeviceLayout }) {
  const floatingCards = CARDS_CONFIG.map((card) => resolveFloatingCardLayout(card, deviceLayout));
  const repelCards = REPEL_CARDS_CONFIG.map((card) => resolveRepelCardLayout(card, deviceLayout));

  return (
    <section
      className="hero-section"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "var(--bg-deep)",
      }}
    >
      {/* Background — swap this div's backgroundImage for any asset */}
      <div style={{
  position: "absolute",
  inset: 0,
  background: "url('images/background4.png')",
  zIndex: 0,
  backgroundSize: "100% 100%",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}} />
 
      {/* Subtle noise grain */}
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
 
 
   <motion.img
  src="images/logo_slogan.png"
  alt="BUILD SOMETHING"
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 1,
    delay: 1.1,
    ease: [0.16, 1, 0.3, 1],
  }}
  style={{
    position: "absolute",
    top: -215,
    left: -30,
    zIndex: 15,
    width: 600, // adjust depending on your design
    height: "auto",
    pointerEvents: "none",
    userSelect: "none",
  }}


/>


  <motion.img
  src="images/logo.png"
  alt="NOVAe"
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 1,
    delay: 1.1,
    ease: [0.16, 1, 0.3, 1],
  }}
  style={{
    position: "absolute",
    top: 0,
    left: 25,
    zIndex: 15,
    width: 100, // adjust depending on your design
    height: "auto",
    pointerEvents: "none",
    userSelect: "none",
  }}


/>
      {/* Center fine grid decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.0, delay: 0.8 }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)",
          pointerEvents: "none",
        }}
      />
      
 
      {/* Floating cards */}
<div className="hero-content" style={{ position: "absolute", inset: 0, zIndex: 10 }}>
  {floatingCards.map((card, i) => (
    <FloatingCard key={card.id} card={card} index={i} />
  ))}
  {repelCards.map((card) => (
    <RepelCard key={card.id} card={card} />
  ))}
</div>

{/* Center ambient glow */}
<div style={{
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600, height: 300,
  background: "radial-gradient(ellipse, rgba(120, 80, 200, 0.06) 0%, transparent 70%)",
  zIndex: 2,
  pointerEvents: "none",
}} />
 
      
 
      {/* Top fade for navbar blending */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "20%",
        background: "linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, transparent 100%)",
        zIndex: 8,
        pointerEvents: "none",
      }} />
 
      {/* Minimal center wordmark — decorative only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
            opacity: 1,
            y: [0, -6, 0],
        }}
        transition={{
            opacity: { duration: 1.2, delay: 1.2, ease: "easeOut" },
            y: { duration: 3.2, delay: 2.4, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          position: "absolute",
          bottom: 12,
          left: "41%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px",
          fontWeight: 300,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.65)",
          textTransform: "uppercase",
        }}>
          Click on the elements to explore
        </span>
      </motion.div>

{/* Frosted glass text box */}
<motion.div
  className="glass-box"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.0, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
  style={{
  position: "absolute",
  bottom: 20,
  left: 20,
  zIndex: 20,
  width: 240,
  backdropFilter: "blur(28px) saturate(1.6) brightness(1.08)",
  WebkitBackdropFilter: "blur(28px) saturate(1.6) brightness(1.08)",
  background: "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)",
  border: "0.5px solid rgba(255,255,255,0.20)",
  borderRadius: 20,
  padding: "24px 20px",
  pointerEvents: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxShadow: "0 24px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
}}
>
  {/* Event CTA */}
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <p style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "10px",
      fontWeight: 400,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.40)",
      margin: 0,
    }}>
      Upcoming Event
    </p>

    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* Image placeholder — replace with your event image */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
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
          style={{ width: 24, height: 24, objectFit: "contain" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "12px",
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
          fontSize: "11px",
          fontWeight: 300,
          color: "rgba(255,255,255,0.40)",
          margin: 0,
        }}>
          November
        </p>
      </div>
    </div>

    <motion.a
      href="#event"
      whileHover={{ background: "rgba(204,255,0,0.15)", borderColor: "rgba(204,255,0,0.5)" }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "9px 0",
        borderRadius: 24,
        background: "rgba(204,255,0,0.08)",
        border: "0.5px solid rgba(204,255,0,0.25)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#ccff00",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      Register
    </motion.a>
  </div>

  {/* Divider */}
  <div style={{
    width: "100%",
    borderTop: "0.5px dashed rgba(255,255,255,0.18)",
  }} />

  {/* Newsletter CTA */}
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <p style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "10px",
      fontWeight: 400,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.40)",
      margin: 0,
    }}>
      Newsletter
    </p>

    <p style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "12px",
      fontWeight: 300,
      lineHeight: 1.5,
      color: "rgba(255,255,255,0.55)",
      margin: 0,
    }}>
      Stay up to date with the latest from NOVAe.
    </p>

    <motion.a
      href="#newsletter"
      whileHover={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.3)" }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "9px 0",
        borderRadius: 24,
        background: "rgba(255,255,255,0.07)",
        border: "0.5px solid rgba(255,255,255,0.16)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.78)",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      Subscribe
    </motion.a>
  </div>
</motion.div>
    </section>
  );
}

function resolveScreenMode(): { screenStatus: "ok" | "unsupported" | "rotate"; deviceLayout: DeviceLayout } {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isLandscape = w > h;
  const isTabletWidth = w >= TABLET_MIN_WIDTH && w < DESKTOP_MIN_WIDTH;
  const isDesktopWidth = w >= DESKTOP_MIN_WIDTH;
  const fallbackDeviceLayout: DeviceLayout = isDesktopWidth ? "desktop" : "tablet";

  if (!isLandscape && (isTabletWidth || isDesktopWidth)) {
    return { screenStatus: "rotate", deviceLayout: isDesktopWidth ? "desktop" : "tablet" };
  }

  if (isLandscape && isDesktopWidth) {
    return { screenStatus: "ok", deviceLayout: "desktop" };
  }

  if (isLandscape && isTabletWidth) {
    return { screenStatus: "ok", deviceLayout: "tablet" };
  }

  return { screenStatus: "unsupported", deviceLayout: fallbackDeviceLayout };
}

export default function App() {
  const [stage, setStage] = useState<"entry" | "loading" | "ready">(() => {
  return sessionStorage.getItem("novae_animated") === "true" ? "ready" : "entry";
});

  const handleEnter = () => {
  const audio = new Audio("images/");
  audio.volume = 1.0;
  audio.play().catch(() => {});
  setStage("loading");
};

  const initialMode = resolveScreenMode();
  const [screenStatus, setScreenStatus] = useState<"ok" | "unsupported" | "rotate">(initialMode.screenStatus);
  const [deviceLayout, setDeviceLayout] = useState<DeviceLayout>(initialMode.deviceLayout);

  useEffect(() => {
    const check = () => {
      const nextMode = resolveScreenMode();
      setScreenStatus(nextMode.screenStatus);
      setDeviceLayout(nextMode.deviceLayout);
    };

    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);


  return (
  <>
    {screenStatus !== "ok" ? (
      <UnsupportedScreen isRotate={screenStatus === "rotate"} />
    ) : (
      <>
        <AnimatePresence>
          {stage === "entry" && (
            <EntryScreen onEnter={handleEnter} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage === "loading" && (
            <LoadingOverlay onRevealComplete={() => {
  sessionStorage.setItem("novae_animated", "true");
  setStage("ready");
}} />
          )}
        </AnimatePresence>

        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: stage === "ready" ? 1 : 0 }}
  transition={{ duration: 2.8, ease: "easeOut", delay: 0 }}
  style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
>
  <div className="hero-scale-root">
    <Navbar />
    <HeroSection deviceLayout={deviceLayout} />
  </div>
</motion.div>
      </>
    )}
  </>
);
}