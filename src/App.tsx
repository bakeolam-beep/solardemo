import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { planets, PlanetData } from "./data/planets";

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);

  // Pre-generate stars for consistent rendering
  const stars = useMemo<Star[]>(() => {
    const result: Star[] = [];
    for (let i = 0; i < 200; i++) {
      result.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() > 0.9 ? 1.5 : 0.8,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    return result;
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const getPlanetPosition = useCallback((index: number, centerX: number, centerY: number) => {
    const planet = planets[index];
    const angle = anglesRef.current[index];
    const x = centerX + Math.cos(angle) * planet.orbitRadius;
    const y = centerY + Math.sin(angle) * planet.orbitRadius * 0.4; // elliptical
    return { x, y };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    stars.forEach((star) => {
      const sx = star.x * width;
      const sy = star.y * height;
      const brightness = Math.sin(Date.now() * 0.001 + star.twinkleOffset) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.6})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw orbit paths
    planets.forEach((planet) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, planet.orbitRadius, planet.orbitRadius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
    sunGradient.addColorStop(0, "#fff7a0");
    sunGradient.addColorStop(0.3, "#ffcc00");
    sunGradient.addColorStop(0.7, "#ff8800");
    sunGradient.addColorStop(1, "rgba(255, 100, 0, 0)");
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 60);
    glowGradient.addColorStop(0, "rgba(255, 200, 0, 0.3)");
    glowGradient.addColorStop(1, "rgba(255, 200, 0, 0)");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Draw planets
    planets.forEach((planet, index) => {
      const pos = getPlanetPosition(index, centerX, centerY);
      const isHovered = hoveredPlanet === planet.name;
      const isSelected = selectedPlanet?.name === planet.name;
      const displaySize = planet.size * (isHovered || isSelected ? 1.4 : 1);

      // Planet shadow/glow
      if (isHovered || isSelected) {
        const glow = ctx.createRadialGradient(pos.x, pos.y, displaySize, pos.x, pos.y, displaySize * 2.5);
        glow.addColorStop(0, planet.color + "60");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, displaySize * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        pos.x - displaySize * 0.3,
        pos.y - displaySize * 0.3,
        0,
        pos.x,
        pos.y,
        displaySize
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(0.7, planet.color);
      planetGradient.addColorStop(1, darkenColor(planet.color, 40));
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, displaySize, 0, Math.PI * 2);
      ctx.fill();

      // Saturn's rings
      if (planet.name === "Saturn") {
        ctx.strokeStyle = "rgba(232, 213, 163, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, displaySize * 1.8, displaySize * 0.5, 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(232, 213, 163, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, displaySize * 2.2, displaySize * 0.6, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Planet label
      if (isHovered || isSelected) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "12px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(planet.name, pos.x, pos.y - displaySize - 8);
      }
    });
  }, [getPlanetPosition, hoveredPlanet, selectedPlanet, stars]);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    if (isPlayingRef.current) {
      planets.forEach((planet, index) => {
        anglesRef.current[index] += planet.speed * speedRef.current * deltaTime * 0.5;
      });
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    draw(ctx, rect.width, rect.height);

    animationRef.current = requestAnimationFrame(animate);
  }, [draw]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let clicked: PlanetData | null = null;
    planets.forEach((planet, index) => {
      const pos = getPlanetPosition(index, centerX, centerY);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      const hitRadius = Math.max(planet.size * 1.5, 15);
      if (dist < hitRadius) {
        clicked = planet;
      }
    });

    setSelectedPlanet(clicked);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let hovered: string | null = null;
    planets.forEach((planet, index) => {
      const pos = getPlanetPosition(index, centerX, centerY);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      const hitRadius = Math.max(planet.size * 1.5, 15);
      if (dist < hitRadius) {
        hovered = planet.name;
      }
    });

    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? "pointer" : "default";
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          🌌 Solar System Explorer
        </h1>
        <p className="text-sm text-gray-400 mt-1">Click on a planet to learn more</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-black/60 backdrop-blur-md rounded-2xl md:rounded-full px-4 md:px-6 py-3 border border-white/10 max-w-[95vw]">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Speed:</span>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24 md:w-32 accent-blue-400"
          />
          <span className="text-xs text-white font-mono w-8">{speed.toFixed(1)}x</span>
        </div>

        {/* Speed Presets */}
        <div className="flex gap-1">
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                speed === s
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <div className="absolute top-16 md:top-20 right-2 md:right-4 left-2 md:left-auto md:w-80 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 text-white shadow-2xl animate-fade-in max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedPlanet.color, 40)}, ${selectedPlanet.color}, ${darkenColor(selectedPlanet.color, 40)})`,
                }}
              />
              <div>
                <h2 className="text-xl font-bold">{selectedPlanet.name}</h2>
                <span className="text-xs text-gray-400">{selectedPlanet.type}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            {selectedPlanet.description}
          </p>

          <div className="space-y-3">
            <InfoRow icon="📏" label="Diameter" value={selectedPlanet.realDiameter} />
            <InfoRow icon="☀️" label="Distance from Sun" value={selectedPlanet.distanceFromSun} />
            <InfoRow icon="🔄" label="Orbital Period" value={selectedPlanet.orbitalPeriod} />
            <InfoRow icon="🌙" label="Known Moons" value={String(selectedPlanet.moons)} />
          </div>
        </div>
      )}

      {/* Planet Legend - Desktop */}
      <div className="absolute top-20 left-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-3 hidden md:block">
        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Planets</h3>
        <div className="space-y-1.5">
          {planets.map((planet) => (
            <button
              key={planet.name}
              onClick={() => setSelectedPlanet(planet)}
              className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-white/10 transition-colors ${
                selectedPlanet?.name === planet.name ? "bg-white/10" : ""
              }`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: planet.color }}
              />
              <span className="text-xs text-gray-300">{planet.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Planet Quick Select - Mobile */}
      <div className="absolute bottom-20 md:hidden left-0 right-0 overflow-x-auto">
        <div className="flex items-center justify-center gap-2 px-4">
          {planets.map((planet) => (
            <button
              key={planet.name}
              onClick={() => setSelectedPlanet(planet)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors flex-shrink-0 ${
                selectedPlanet?.name === planet.name ? "bg-white/15" : "bg-white/5"
              }`}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: planet.color }}
              />
              <span className="text-[9px] text-gray-300 whitespace-nowrap">{planet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}
