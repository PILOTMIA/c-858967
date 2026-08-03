import { useEffect, useRef } from "react";
import GlobeGl, { type GlobeInstance } from "globe.gl";
import {
  BANK_BY_CODE,
  CENTRAL_BANKS,
  FlowArc,
  INFLOW_COLOR,
  OUTFLOW_COLOR,
  WeekFrame,
  fmtNum,
} from "./currencyFlowData";

interface Props {
  frame: WeekFrame | undefined;
  visibleCodes: string[];
  colorMode: "currency" | "direction";
  autoRotate: boolean;
  onSelectBank: (code: string) => void;
  onSelectArc: (arc: FlowArc) => void;
}

interface PointDatum {
  code: string;
  lat: number;
  lng: number;
  color: string;
  size: number;
  label: string;
}

interface ArcDatum extends FlowArc {
  _stroke: number;
  _speed: number;
  _label: string;
}

const tip = (title: string, lines: string[]) => `
  <div style="background:rgba(6,10,20,.92);border:1px solid rgba(120,160,255,.35);
    border-radius:10px;padding:10px 12px;color:#e6edff;font-family:ui-monospace,monospace;
    font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,.6);backdrop-filter:blur(8px);max-width:260px">
    <div style="font-weight:700;letter-spacing:.04em;margin-bottom:4px">${title}</div>
    ${lines.map((l) => `<div style="opacity:.85;line-height:1.5">${l}</div>`).join("")}
  </div>`;

const GlobeCurrencyFlow = ({
  frame,
  visibleCodes,
  colorMode,
  autoRotate,
  onSelectBank,
  onSelectArc,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);

  // Keep latest callbacks / mode in refs so the globe is never re-created.
  const onSelectBankRef = useRef(onSelectBank);
  const onSelectArcRef = useRef(onSelectArc);
  const colorModeRef = useRef(colorMode);
  onSelectBankRef.current = onSelectBank;
  onSelectArcRef.current = onSelectArc;
  colorModeRef.current = colorMode;

  // Stable object identity per arc / point so three-globe updates instead of
  // tearing down + restarting the dash animations on every frame change.
  const arcCache = useRef(new Map<string, ArcDatum>());
  const pointCache = useRef(new Map<string, PointDatum>());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const globe = new GlobeGl(el)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-dark.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
      .showGraticules(true)
      .showAtmosphere(true)
      .atmosphereColor("#4f8cff")
      .atmosphereAltitude(0.22)
      .pointAltitude((d) => (d as PointDatum).size)
      .pointRadius(0.32)
      .pointColor((d) => (d as PointDatum).color)
      .pointLabel((d) => (d as PointDatum).label)
      .pointsTransitionDuration(1200)
      .onPointClick((d) => onSelectBankRef.current((d as PointDatum).code))
      .arcAltitudeAutoScale(0.45)
      .arcDashLength(0.4)
      .arcDashGap(0.85)
      .arcDashInitialGap(() => Math.random())
      .arcStroke((d) => (d as ArcDatum)._stroke)
      .arcDashAnimateTime((d) => (d as ArcDatum)._speed)
      .arcLabel((d) => (d as ArcDatum)._label)
      .arcColor((d) => {
        const a = d as ArcDatum;
        if (colorModeRef.current === "direction") {
          return a.change > 0 ? [`${OUTFLOW_COLOR}00`, INFLOW_COLOR] : [`${INFLOW_COLOR}00`, OUTFLOW_COLOR];
        }
        const src = BANK_BY_CODE[a.from]?.color ?? "#888";
        const dst = BANK_BY_CODE[a.to]?.color ?? "#888";
        return [`${src}22`, dst];
      })
      .arcsTransitionDuration(1200)
      .onArcClick((d) => onSelectArcRef.current(d as FlowArc));

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.45;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.08;
    globe.pointOfView({ lat: 25, lng: -20, altitude: 2.4 });
    globeRef.current = globe;

    let raf = 0;
    const resize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => globe.width(el.clientWidth).height(el.clientHeight));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      globe._destructor?.();
      el.innerHTML = "";
      globeRef.current = null;
      arcCache.current.clear();
      pointCache.current.clear();
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = autoRotate;
  }, [autoRotate]);

  // Re-paint colors in place when the color mode toggles (no data churn).
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.arcColor(globe.arcColor());
  }, [colorMode]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const points = CENTRAL_BANKS.filter((b) => visibleCodes.includes(b.code)).map((b) => {
      const p = frame?.points.find((x) => x.code === b.code);
      const mag = p ? Math.min(1, Math.abs(p.change) / 60000) : 0;
      const existing = pointCache.current.get(b.code) ?? {
        code: b.code,
        lat: b.lat,
        lng: b.lng,
        color: b.color,
        size: 0.035,
        label: "",
      };
      existing.size = 0.035 + mag * 0.09;
      existing.label = tip(`${b.code} · ${b.bank}`, [
        `${b.city}, ${b.country}`,
        p ? `Net position: <b>${fmtNum(p.net)}</b>` : "No COT contract reported by the CFTC",
        p ? `Weekly change: <b>${fmtNum(p.change)}</b> (${p.pctChange.toFixed(1)}%)` : "",
      ].filter(Boolean));
      pointCache.current.set(b.code, existing);
      return existing;
    });

    const rawArcs = (frame?.arcs ?? []).filter(
      (a) => visibleCodes.includes(a.from) && visibleCodes.includes(a.to),
    );
    const maxMag = Math.max(1, ...rawArcs.map((a) => a.magnitude));

    const arcs = rawArcs.map((a) => {
      const existing = arcCache.current.get(a.id) as ArcDatum | undefined;
      const merged: ArcDatum = Object.assign(existing ?? ({} as ArcDatum), a, {
        _stroke: 0.25 + (a.magnitude / maxMag) * 1.1,
        _speed: 4200 - (a.magnitude / maxMag) * 1800,
        _label: tip(`${a.pair} flow`, [
          `${BANK_BY_CODE[a.from]?.city} → ${BANK_BY_CODE[a.to]?.city}`,
          `Net change: <b>${fmtNum(a.change)}</b> contracts`,
          `Trend: ${a.change > 0 ? "Speculators building longs" : "Speculators cutting longs / adding shorts"}`,
        ]),
      });
      arcCache.current.set(a.id, merged);
      return merged;
    });

    globe.pointsData(points).arcsData(arcs);
  }, [frame, visibleCodes]);

  return <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />;
};

export default GlobeCurrencyFlow;
