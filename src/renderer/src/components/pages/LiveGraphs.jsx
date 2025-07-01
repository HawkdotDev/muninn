import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { Minus, Plus, Zap, Flame } from "lucide-react";

const LiveGraphs = () => {
  const [data, setData] = useState([]);
  const [uploadData, setUploadData] = useState(521.8);
  const [downloadData, setDownloadData] = useState(235.4);
  const [uploadSpeed, setUploadSpeed] = useState(1);
  const [downloadSpeed, setDownloadSpeed] = useState(45);
  const [wanData, setWanData] = useState(717.4);
  const [lanData, setLanData] = useState(39.9);
  const [totalData, setTotalData] = useState(757.2);
  const [timeframe, setTimeframe] = useState(60); // seconds
  const [showLegend, setShowLegend] = useState({
    upload: true,
    download: true,
    total: true,
  });
  const intervalRef = useRef(null);

  // Generate realistic network data
  const generateDataPoint = () => {
    const timestamp = Date.now();
    const upload = Math.max(
      0,
      Math.min(400, Math.random() * 150 + Math.sin(timestamp / 15000) * 80 + 50)
    );
    const download = Math.max(
      0,
      Math.min(
        400,
        Math.random() * 200 + Math.sin(timestamp / 12000) * 100 + 80
      )
    );
    const total = Math.max(
      0,
      Math.min(400, Math.random() * 180 + Math.sin(timestamp / 18000) * 90 + 60)
    );

    return {
      time: timestamp,
      upload: Math.round(upload * 10) / 10,
      download: Math.round(download * 10) / 10,
      total: Math.round(total * 10) / 10,
    };
  };

  useEffect(() => {
    // Initialize with some data
    const initialData = [];

    for (let i = 0; i < timeframe; i++) {
      const timestamp = Date.now() - (timeframe - i) * 2000;
      initialData.push({
        time: timestamp,
        upload: Math.random() * 150 + 50,
        download: Math.random() * 200 + 80,
        total: Math.random() * 180 + 60,
      });
    }

    setData(initialData);

    // Start real-time updates
    intervalRef.current = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData, generateDataPoint()];
        return newData.slice(-timeframe);
      });

      // Update stats occasionally
      if (Math.random() > 0.8) {
        setUploadData((prev) => prev + (Math.random() - 0.5) * 10);
        setDownloadData((prev) => prev + (Math.random() - 0.5) * 8);
        setUploadSpeed(Math.max(0, Math.random() * 5));
        setDownloadSpeed(Math.max(0, Math.random() * 100));
        setWanData((prev) => prev + (Math.random() - 0.5) * 15);
        setLanData((prev) => prev + (Math.random() - 0.5) * 5);
        setTotalData((prev) => prev + (Math.random() - 0.5) * 12);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeframe]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const visibleData = data.slice(-timeframe);
  const allYValues = visibleData
    .flatMap((d) => [
      showLegend.upload ? d.upload : null,
      showLegend.download ? d.download : null,
      showLegend.total ? d.total : null,
    ])
    .filter((v) => v !== null);

  const maxY = Math.max(...allYValues, 50); // Ensure minimum reference range
  const step = Math.ceil(maxY / 4); // 4 reference lines
  const referenceLevels = [step, step * 2, step * 3, step * 4].filter(
    (val) => val < maxY * 1.1 // slightly above max
  );

  const CustomTooltip = ({ active, payload, label }) => {
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
  };

  const toggleLegendItem = (key) => {
    setShowLegend((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const adjustTimeframe = (direction) => {
    if (direction === "increase") {
      setTimeframe((prev) => Math.min(300, prev + 30)); // Max 5 minutes
    } else {
      setTimeframe((prev) => Math.max(30, prev - 30)); // Min 30 seconds
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#242424] via-zinc-800 to-[#222222] text-white relative overflow-hidden">
      <div className="relative z-10 py-6">
        {/* Header */}
        <div className="w-[40%] mx-auto flex items-center justify-evenly mb-8">
          <button className="relative group flex items-center gap-2 bg-stone-700 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-purple-600 transition">
            <Plus size={16} />
            New
          </button>
          <button className="relative group flex items-center gap-2 bg-stone-700 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-purple-600 transition">
            <Zap size={16} />
            New
          </button>
          <button className="relative group flex items-center gap-2 bg-stone-700 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-purple-600 transition">
            <Flame size={16} />
            New
          </button>
        </div>

        {/* Main Chart */}
        <div className="relative mb-8">
          {/* Chart Controls */}
          <div className="flex items-center justify-between mb-6 px-6">
            <div className="flex items-center gap-4">
              {/* Legend */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleLegendItem("upload")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                    showLegend.upload
                      ? "bg-pink-500/20 text-pink-300"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  <div className="w-3 h-3 bg-pink-500 rounded-full" />
                  <span className="text-sm">Upload</span>
                </button>
                <button
                  onClick={() => toggleLegendItem("download")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                    showLegend.download
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Download</span>
                </button>
                <button
                  onClick={() => toggleLegendItem("total")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                    showLegend.total
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm">Total</span>
                </button>
              </div>
            </div>

            {/* Timeframe Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-300">Timeframe:</span>
              <button
                onClick={() => adjustTimeframe("decrease")}
                className="p-1 bg-purple-700/50 hover:bg-purple-600/50 rounded transition-colors"
                disabled={timeframe <= 30}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium min-w-16 text-center">
                {timeframe < 60
                  ? `${timeframe}s`
                  : `${Math.round(timeframe / 60)}m`}
              </span>
              <button
                onClick={() => adjustTimeframe("increase")}
                className="p-1 bg-purple-700/50 hover:bg-purple-600/50 rounded transition-colors"
                disabled={timeframe >= 300}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-[40vh]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
                  ticks={
                    data.length >= 10
                      ? data
                          .filter(
                            (_, i) => i % Math.floor(data.length / 10) === 0
                          )
                          .map((d) => d.time)
                      : data.map((d) => d.time)
                  }
                />

                <YAxis
                  domain={["auto", "auto"]}
                  allowDataOverflow={true}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#C4B5FD", fontSize: 12 }}
                  tickFormatter={(value) => `${value} KB/s`}
                />

                {/* Horizontal reference lines for speed benchmarks */}

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

        {/* Timeline */}
        <div className="relative px-6">
          <div className="h-2 bg-purple-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-60" />
          </div>
          <div className="flex justify-between mt-2 text-sm text-purple-300">
            <span>12:40:40</span>
            <span>12:42:00</span>
            <span>12:43:20</span>
            <span>12:44:40</span>
          </div>
          <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full transform -translate-y-1" />
          <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full transform -translate-y-1" />
        </div>
      </div>
    </div>
  );
};

export default LiveGraphs;
