import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Configuration ──────────────────────────────────────────────────────────
const TARGET_DATE = new Date('2026-04-25T00:00:00').getTime();
const RING_RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

export default function HM_ClockPanel() {
  const [timeLeft, setTimeLeft] = useState(calculateTime());
  const rafRef = useRef();

  function calculateTime() {
    const now = Date.now();
    const diff = Math.max(0, TARGET_DATE - now);
    const totalDuration = 15 * 24 * 60 * 60 * 1000;

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      ms: Math.floor((diff % 1000) / 10),
      progress: diff / totalDuration
    };
  }

  const tick = useCallback(() => {
    setTimeLeft(calculateTime());
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - timeLeft.progress);

  return (
    <div className="hm-clock-panel">
      {/* Editorial Watermark — sits behind clock, fully contained */}
      <div className="branding-background">H&M</div>

      <div className="content-container">
        {/* Top Branding Section */}
        <header className="clock-header">
          <h1 className="hm-logo">H&M</h1>
          <div className="collection-tag">SPRING / SUMMER 2026</div>
        </header>

        {/* Main Visual Clock */}
        <div className="visual-stage">
  <div className="time-readout">
    <div className="unit-row">
      
      <div className="time-block">
        <span className="value">{pad(timeLeft.days)}</span>
        <span className="label">DAYS</span>
      </div>

      <span className="separator">.</span>

      <div className="time-block">
        <span className="value">{pad(timeLeft.hours)}</span>
        <span className="label">HRS</span>
      </div>

      <span className="separator">.</span>

      <div className="time-block">
        <span className="value">{pad(timeLeft.minutes)}</span>
        <span className="label">MIN</span>
      </div>

      {/* Seconds minimal */}
      <div className="time-block small-sec">
        <span className="sec-value">{pad(timeLeft.seconds)}</span>
      </div>

    </div>
  </div>
</div>

        {/* Bottom Metadata */}
        <footer className="clock-footer">
          <div className="launch-text">LIMITED EDITION LAUNCH</div>
        </footer>
      </div>

      <style jsx>{`
        .hm-clock-panel {
          width: 30vw;
          height: 100vh;
          background: #ffffff;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }

        /* Watermark: centered behind the clock, fully visible, never clipped */
        .branding-background {
  position: absolute;
  width: 100%;
  text-align: center;

  font-size: min(18vw, 240px);
  font-weight: 900;
  color: rgba(0, 0, 0, 0.03);

  top: 55%;
  transform: translateY(-50%);

  letter-spacing: -0.08em;

  z-index: 0;
}

        .content-container {
          width: 80%;
          height: 80%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 2;
        }

        .clock-header {
          border-bottom: 1.5px solid #000;
          padding-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .hm-logo {
          font-size: 84px;
          font-weight: 900;
          margin: 0;
          letter-spacing: -2px;
        }

        .collection-tag {
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 3px;
          padding-bottom: 10px;
        }

        .visual-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .time-readout {
          text-align: center;
        }

        .unit-row {
          display: flex;
          align-items: flex-end;
          gap: 0;
        }

        .time-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

       .value {
  font-size: 120px;
  font-weight: 300;
  letter-spacing: -2px;
}

        /* Seconds: same row but slightly stepped down via alignment, red */
        .sec-value {
  font-size: 60px;
  color: #e50010;
  margin-left: 10px;
}
  .small-sec {
  align-self: flex-end;
  padding-bottom: 10px;
}

        
.label {
  font-size: 10px;
  letter-spacing: 3px;
  color: #888;
}

        .sec-label {
          color: #e50010;
        }

        .separator {
  font-size: 100px;
  font-weight: 200;
  color: #ddd;
  margin: 0 10px;
}

        .clock-footer {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #e50010;
          border-radius: 50%;
        }

        .launch-text {
          color: #888;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}