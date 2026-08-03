import { useEffect, useRef } from "react";
import GlobeGl from "globe.gl";
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
  const globeRef = useRef<ReturnType<typeof GlobeGl> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const globe = GlobeGl()(el)
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
      .onPointClick((d) => onSelectBank((d as PointDatum).code))
      .ringAltitude(0.006)
      .ringColor((d) => () => (d as PointDatum).color)
      .ringMaxRadius(3.2)
      .ringPropagationSpeed(1.6)
      .ringRepeatPeriod(1400)
      .arcAltitudeAutoScale(0.45)
      .arcDashLength(0.35)
      .arcDashGap(0.9)
      .arcDashAnimateTime(2200)
      .arcsTransitionDuration(600)
      .onArcClick((d) => onSelectArc(d as FlowArc));

    globe.controls().autoRotateSpeed = 0.45;
    globe.pointOfView({ lat: 25, lng: -20, altitude: 2.4 });
    globeRef.current = globe;

    const resize = () => {
      globe.width(el.clientWidth).height(el.clientHeight);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      globe._destructor?.();
      el.innerHTML = "";
      globeRef.current = null;
    };
  }, [onSelectArc, onSelectBank]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const points: PointDatum[] = CENTRAL_BANKS.filter((b) => visibleCodes.includes(b.code)).map((b) => {
      const p = frame?.points.find((x) => x.code === b.code);
      const mag = p ? Math.min(1, Math.abs(p.change) / 60000) : 0;
      return {
        code: b.code,
        lat: b.lat,
        lng: b.lng,
        color: b.color,
        size: 0.035 + mag * 0.09,
        label: tip(`${b.code} · ${b.bank}`, [
          `${b.city}, ${b.country}`,
          p
            ? `Net position: <b>${fmtNum(p.net)}</b>`
            : "No COT contract reported by the CFTC",
          p ? `Weekly change: <b>${fmtNum(p.change)}</b> (${p.pctChange.toFixed(1)}%)` : "",
        ].filter(Boolean)),
      };
    });

    const arcs = (frame?.arcs ?? []).filter(
      (a) => visibleCodes.includes(a.from) && visibleCodes.includes(a.to),
    );
    const maxMag = Math.max(1, ...arcs.map((a) => a.magnitude));

    globe
      .pointsData(points)
      .ringsData(points)
      .arcsData(arcs)
      .arcStroke((d) => 0.25 + ((d as FlowArc).magnitude / maxMag) * 1.1)
      .arcDashAnimateTime((d) => 3000 - ((d as FlowArc).magnitude / maxMag) * 1800)
      .arcColor((d) => {
        const a = d as FlowArc;
        if (colorMode === "direction") {
          return a.change > 0 ? [`${OUTFLOW_COLOR}00`, INFLOW_COLOR] : [`${INFLOW_COLOR}00`, OUTFLOW_COLOR];
        }
        const src = BANK_BY_CODE[a.from]?.color ?? "#888";
        const dst = BANK_BY_CODE[a.to]?.color ?? "#888";
        return [`${src}22`, dst];
      })
      .arcLabel((d) => {
        const a = d as FlowArc;
        return tip(`${a.pair} flow`, [
          `${BANK_BY_CODE[a.from]?.city} → ${BANK_BY_CODE[a.to]?.city}`,
          `Net change: <b>${fmtNum(a.change)}</b> contracts`,
          `Trend: ${a.change > 0 ? "Speculators building longs" : "Speculators cutting longs / adding shorts"}`,
        ]);
      });
  }, [frame, visibleCodes, colorMode]);

  return <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />;
};

export default GlobeCurrencyFlow;
