import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { Minus, Plus } from "lucide-react";

const LiveGraphs = () => {
  const [allData, setAllData] = useState([]); // Full history data
  const [timeframe, setTimeframe] = useState(300); // Total history in seconds (min 5 minutes)
  const [showLegend, setShowLegend] = useState({
    upload: true,
    download: true,
    total: true,
  });
  const intervalRef = useRef(null);
  const [isDragging, setIsDragging] = useState({ active: false, handle: null });
  const [sliderRange, setSliderRange] = useState([240, 300]); // View last 60 seconds by default

  // Memoized data generation function
  const generateDataPoint = useCallback(() => {
    const timestamp = Date.now();
    const upload = Math.max(
      0,
      Math.min(450, Math.random() * 150 + Math.sin(timestamp / 15000) * 80 + 50)
    );
    const download = Math.max(
      0,
      Math.min(
        600,
        Math.random() * 200 + Math.sin(timestamp / 12000) * 100 + 80
      )
    );
    const total = Math.max(
      0,
      Math.min(500, Math.random() * 180 + Math.sin(timestamp / 18000) * 90 + 60)
    );

    return {
      time: timestamp,
      upload: Math.round(upload * 10) / 10,
      download: Math.round(download * 10) / 10,
      total: Math.round(total * 10) / 10,
    };
  }, []);

  // Initialize data and start updates
  useEffect(() => {
    // Initialize with some data
    const initialData = [];
    const now = Date.now();

    for (let i = 0; i < timeframe; i++) {
      const timestamp = now - (timeframe - i) * 2000;
      initialData.push({
        time: timestamp,
        upload: Math.round((Math.random() * 150 + 50) * 10) / 10,
        download: Math.round((Math.random() * 200 + 80) * 10) / 10,
        total: Math.round((Math.random() * 180 + 60) * 10) / 10,
      });
    }

    setAllData(initialData);

    // Start real-time updates
    intervalRef.current = setInterval(() => {
      setAllData((prevData) => {
        const newData = [...prevData, generateDataPoint()];
        return newData.slice(-timeframe); // Keep only the timeframe amount of data
      });
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeframe, generateDataPoint]);

  // Update slider range when timeframe changes
  useEffect(() => {
    const viewWindow = sliderRange[1] - sliderRange[0];
    const newEnd = timeframe;
    const newStart = Math.max(0, timeframe - viewWindow);
    setSliderRange([newStart, newEnd]);
  }, [timeframe]);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  // Get visible data for main graph based on slider range
  const visibleData = useMemo(() => {
    const totalPoints = allData.length;
    const startIndex = Math.floor((sliderRange[0] / timeframe) * totalPoints);
    const endIndex = Math.floor((sliderRange[1] / timeframe) * totalPoints);
    return allData.slice(startIndex, endIndex);
  }, [allData, sliderRange, timeframe]);

  // Memoized calculations for main graph
  const referenceLevels = useMemo(() => {
    const allYValues = visibleData
      .flatMap((d) => [
        showLegend.upload ? d.upload : null,
        showLegend.download ? d.download : null,
        showLegend.total ? d.total : null,
      ])
      .filter((v) => v !== null);

    if (allYValues.length === 0) return [];

    const maxY = Math.max(...allYValues, 50);
    const step = Math.ceil(maxY / 4);
    return [step, step * 2, step * 3, step * 4].filter(
      (val) => val < maxY * 1.1
    );
  }, [visibleData, showLegend]);

  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-purple-900/90 backdrop-blur-sm border border-purple-500/50 rounded-lg px-4 py-3 shadow-xl">
        <div className="text-purple-200 text-sm mb-2">{formatTime(label)}</div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-medium capitalize">
              {entry.name}: {entry.value.toFixed(1)} KB/s
            </span>
          </div>
        ))}
      </div>
    );
  }, [formatTime]);

  const toggleLegendItem = useCallback((key) => {
    setShowLegend((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const adjustTimeframe = useCallback((direction) => {
    if (direction === "increase") {
      setTimeframe((prev) => Math.min(1800, prev + 300)); // Max 30 minutes
    } else {
      setTimeframe((prev) => Math.max(300, prev - 300)); // Min 5 minutes
    }
  }, []);

  // Handle slider interaction
  const handleSliderClick = useCallback((e) => {
    if (isDragging.active) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const position = percentage * timeframe;

    const viewWindow = sliderRange[1] - sliderRange[0];
    const halfWindow = viewWindow / 2;
    let start = Math.max(0, position - halfWindow);
    let end = Math.min(timeframe, position + halfWindow);

    if (end - start < viewWindow) {
      if (start === 0) {
        end = Math.min(timeframe, viewWindow);
      } else {
        start = Math.max(0, timeframe - viewWindow);
      }
    }

    setSliderRange([start, end]);
  }, [isDragging.active, timeframe, sliderRange]);

  // Handle dragging
  const handleMouseDown = useCallback((e, handle) => {
    e.stopPropagation();
    setIsDragging({ active: true, handle });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.active) return;

    const sliderElement = document.getElementById("timeline-slider");
    if (!sliderElement) return;

    const rect = sliderElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = x / rect.width;
    const position = percentage * timeframe;

    if (isDragging.handle === "start") {
      const newStart = Math.max(0, Math.min(position, sliderRange[1] - 30));
      setSliderRange([newStart, sliderRange[1]]);
    } else if (isDragging.handle === "end") {
      const newEnd = Math.min(
        timeframe,
        Math.max(position, sliderRange[0] + 30)
      );
      setSliderRange([sliderRange[0], newEnd]);
    }
  }, [isDragging, sliderRange, timeframe]);

  const handleMouseUp = useCallback(() => {
    setIsDragging({ active: false, handle: null });
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging.active) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Memoized slider calculations
  const { sliderLeftPercent, sliderWidthPercent } = useMemo(() => ({
    sliderLeftPercent: (sliderRange[0] / timeframe) * 100,
    sliderWidthPercent: ((sliderRange[1] - sliderRange[0]) / timeframe) * 100,
  }), [sliderRange, timeframe]);

  const formatDuration = useCallback((seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }, []);

  // Memoized tick values for better performance
  const xAxisTicks = useMemo(() => {
    if (visibleData.length >= 10) {
      return visibleData
        .filter((_, i) => i % Math.floor(visibleData.length / 10) === 0)
        .map((d) => d.time);
    }
    return visibleData.map((d) => d.time);
  }, [visibleData]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#242424] via-zinc-800 to-[#222222] text-white relative overflow-hidden">
      <div className="relative z-10 mt-4">
        {/* Main Graph */}
        <div className="relative mb-8">
          {/* Chart Controls */}
          <div className="flex items-center justify-between mb-6 px-6">
            <div className="flex items-center gap-4">
              {/* Legend */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => toggleLegendItem("upload")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all cursor-pointer ${
                    showLegend.upload
                      ? "bg-pink-500/20 text-pink-300"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  <div className="w-3 h-3 bg-pink-500 rounded-full" />
                  <span className="text-sm">Upload</span>
                </div>
                <div
                  onClick={() => toggleLegendItem("download")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all cursor-pointer ${
                    showLegend.download
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Download</span>
                </div>
                <div
                  onClick={() => toggleLegendItem("total")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all cursor-pointer ${
                    showLegend.total
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm">Total</span>
                </div>
              </div>
            </div>

            {/* History Timeframe Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-300">History:</span>
              <button
                onClick={() => adjustTimeframe("decrease")}
                className="p-1 bg-purple-700/50 hover:bg-purple-600/50 rounded transition-colors disabled:opacity-50"
                disabled={timeframe <= 300}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium min-w-16 text-center">
                {timeframe < 3600
                  ? `${Math.round(timeframe / 60)}m`
                  : `${Math.round(timeframe / 3600)}h`}
              </span>
              <button
                onClick={() => adjustTimeframe("increase")}
                className="p-1 bg-purple-700/50 hover:bg-purple-600/50 rounded transition-colors disabled:opacity-50"
                disabled={timeframe >= 1800}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-[40vh]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleData}>
                <defs>
                  <linearGradient
                    id="uploadGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient
                    id="downloadGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient
                    id="totalGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  type="number"
                  scale="time"
                  domain={["auto", "auto"]}
                  tickFormatter={formatTime}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#C4B5FD", fontSize: 12 }}
                  ticks={xAxisTicks}
                />

                <YAxis
                  domain={["auto", "auto"]}
                  allowDataOverflow={true}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#C4B5FD", fontSize: 12 }}
                  tickFormatter={(value) => `${value} KB/s`}
                />

                {referenceLevels.map((y, idx) => (
                  <ReferenceLine
                    key={idx}
                    y={y}
                    stroke="#6B7280"
                    strokeDasharray="3 3"
                    strokeOpacity={0.4}
                  />
                ))}

                <Tooltip content={<CustomTooltip />} />

                {showLegend.total && (
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#totalGradient)"
                    animationDuration={0}
                    name="total"
                  />
                )}
                {showLegend.upload && (
                  <Area
                    type="monotone"
                    dataKey="upload"
                    stroke="#EC4899"
                    strokeWidth={2}
                    fill="url(#uploadGradient)"
                    animationDuration={0}
                    name="upload"
                  />
                )}
                {showLegend.download && (
                  <Area
                    type="monotone"
                    dataKey="download"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#downloadGradient)"
                    animationDuration={0}
                    name="download"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Slider for viewing range */}
        <div className="relative mb-4 mx-6">
          <div className="mb-2 flex justify-between text-xs text-purple-300">
            <span>
              Viewing: {formatDuration(sliderRange[1] - sliderRange[0])}
            </span>
            <span>
              Range: {formatDuration(timeframe - sliderRange[1])} - {formatDuration(timeframe - sliderRange[0])} ago
            </span>
            <span>Total history: {formatDuration(timeframe)} ({allData.length} points)</span>
          </div>

          <div
            id="timeline-slider"
            className="relative h-1 bg-purple-800/50 rounded-full cursor-pointer select-none"
            onClick={handleSliderClick}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 rounded-full" />

            {/* Selection window */}
            <div
              className="absolute top-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-80 transition-all duration-75"
              style={{
                left: `${sliderLeftPercent}%`,
                width: `${sliderWidthPercent}%`,
              }}
            />

            {/* Start handle */}
            <div
              className="absolute top-1/2 w-5 h-5 bg-white rounded-full transform -translate-y-1/2 shadow-lg cursor-grab active:cursor-grabbing border-2 border-pink-400 hover:scale-110 transition-transform z-10"
              style={{ left: `${sliderLeftPercent}%`, marginLeft: "-10px" }}
              onMouseDown={(e) => handleMouseDown(e, "start")}
            />

            {/* End handle */}
            <div
              className="absolute top-1/2 w-5 h-5 bg-white rounded-full transform -translate-y-1/2 shadow-lg cursor-grab active:cursor-grabbing border-2 border-blue-400 hover:scale-110 transition-transform z-10"
              style={{
                left: `${sliderLeftPercent + sliderWidthPercent}%`,
                marginLeft: "-10px",
              }}
              onMouseDown={(e) => handleMouseDown(e, "end")}
            />
          </div>
        </div>

        {/* Full History Graph */}
        <div className="h-[6vh] mx-5 bg-[#181818]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={allData}>
              <defs>
                <linearGradient id="uploadGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient
                  id="downloadGradient2"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="totalGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              {showLegend.total && (
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#totalGradient2)"
                  animationDuration={0}
                  name="total"
                />
              )}
              {showLegend.upload && (
                <Area
                  type="monotone"
                  dataKey="upload"
                  stroke="#EC4899"
                  strokeWidth={2}
                  fill="url(#uploadGradient2)"
                  animationDuration={0}
                  name="upload"
                />
              )}
              {showLegend.download && (
                <Area
                  type="monotone"
                  dataKey="download"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#downloadGradient2)"
                  animationDuration={0}
                  name="download"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveGraphs;