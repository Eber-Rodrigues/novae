import React from "react";

type DeviceLayout = "desktop" | "tablet";

export function MobileHero({ deviceLayout }: { deviceLayout: DeviceLayout }) {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg,#070607,#0f0f10)",
      color: "#fff",
      padding: 24,
      boxSizing: "border-box",
    }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <img src="images/logo.png" alt="NOVAe" style={{ width: 96, height: "auto", marginBottom: 18 }} />
        <h2 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 600 }}>
          NOVAe
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 8, fontSize: 13 }}>
          For the best experience, view this site on a larger screen in landscape.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center" }}>
          <a href="#novae" style={{
            padding: "10px 16px",
            borderRadius: 20,
            background: "#ccff00",
            color: "#061",
            textDecoration: "none",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
          }}>Explore</a>
          <a href="#newsletter" style={{
            padding: "10px 16px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
          }}>Subscribe</a>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", marginTop: 16, fontSize: 12 }}>
          Layout: {deviceLayout}
        </p>
      </div>
    </div>
  );
}

export default MobileHero;
