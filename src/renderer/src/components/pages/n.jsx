const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { ChevronDown, ArrowUp, ArrowDown, Bell, Plus, Minus } from 'lucide-react';

const NetworkMonitor = () => {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState(60); // seconds to show
  const [allData, setAllData] = useState([]); // store all historical data
  const [uploadData, setUploadData] = useState(521.8);
  const [downloadData, setDownloadData] = useState(235.4);
  const [uploadSpeed, setUploadSpeed] = useState(1);
  const [downloadSpeed, setDownloadSpeed] = useState(45);
  const [wanData, setWanData] = useState(717.4);
  const [lanData, setLanData] = useState(39.9);
  const [totalData, setTotalData] = useState(757.2);
  const intervalRef = useRef(null);
  const maxStoredPoints = 300; // store more data for different timeframes

  // Timeframe options
  const timeframeOptions = [
    { label: '1min', value: 30 },
    { label: '2min', value: 60 },
    { label: '5min', value: 150 },
    { label: '10min', value: 300 }
  ];

  // Generate realistic network data
  const generateDataPoint = () => {
    const timestamp = Date.now();
    const upload = Math.max(0, Math.min(400, 
      Math.random() * 150 + Math.sin(timestamp / 15000) * 80 + 50
    ));
    const download = Math.max(0, Math.min(400, 
      Math.random() * 200 + Math.sin(timestamp / 12000) * 100 + 80
    ));
    const total = Math.max(0, Math.min(400, 
      Math.random() * 180 + Math.sin(timestamp / 18000) * 90 + 60
    ));
    
    return {
      time: timestamp,
      upload: Math.round(upload * 10) / 10,
      download: Math.round(download * 10) / 10,
      total: Math.round(total * 10) / 10
    };
  };

  useEffect(() => {
    // Initialize with some data
    const initialData = [];
    
    for (let i = 0; i < maxStoredPoints; i++) {
      const timestamp = Date.now() - (maxStoredPoints - i) * 2000;
      initialData.push({
        time: timestamp,
        upload: Math.random() * 150 + 50,
        download: Math.random() * 200 + 80,
        total: Math.random() * 180 + 60
      });
    }
    
    setAllData(initialData);

    // Start real-time updates
    intervalRef.current = setInterval(() => {
      const newPoint = generateDataPoint();
      
      setAllData(prevData => {
        const newData = [...prevData, newPoint];
        return newData.slice(-maxStoredPoints);
      });
      
      // Update stats occasionally
      if (Math.random() > 0.8) {
        setUploadData(prev => prev + (Math.random() - 0.5) * 10);
        setDownloadData(prev => prev + (Math.random() - 0.5) * 8);
        setUploadSpeed(Math.max(0, Math.random() * 5));
        setDownloadSpeed(Math.max(0, Math.random() * 100));
        setWanData(prev => prev + (Math.random() - 0.5) * 15);
        setLanData(prev => prev + (Math.random() - 0.5) * 5);
        setTotalData(prev => prev + (Math.random() - 0.5) * 12);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update displayed data when timeframe or allData changes
  useEffect(() => {
    setData(allData.slice(-timeframe));
  }, [allData, timeframe]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-purple-500/50 rounded-lg px-4 py-3 text-sm shadow-xl">
        <div className="text-purple-200 mb-2 font-medium">{formatTime(label)}</div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-medium min-w-16">
              {entry.dataKey === 'upload' ? 'Upload' : 
               entry.dataKey === 'download' ? 'Download' : 'Total'}:
            </span>
            <span className="text-purple-200">
              {entry.value.toFixed(1)} KB
            </span>
          </div>
        ))}
      </div>
    );
  };

  const increaseTimeframe = () => {
    setTimeframe(prev => Math.min(300, prev + 30));
  };

  const decreaseTimeframe = () => {
    setTimeframe(prev => Math.max(30, prev - 30));
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-transparent" />
      
      <div className="relative z-10 p-6">
        {/* Header with timeframe controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">400 KB</span>
              <ChevronDown className="w-5 h-5 text-purple-300" />
            </div>
            
            {/* Timeframe controls */}
            <div className="flex items-center gap-2 bg-purple-800/50 rounded-lg p-1">
              <button 
                onClick={decreaseTimeframe}
                className="p-1 hover:bg-purple-700/50 rounded transition-colors"
                disabled={timeframe <= 30}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium min-w-16 text-center">
                {Math.round(timeframe / 30)}min
              </span>
              <button 
                onClick={increaseTimeframe}
                className="p-1 hover:bg-purple-700/50 rounded transition-colors"
                disabled={timeframe >= 300}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              NEW
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full" />
            <span className="text-sm text-purple-200">Upload</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-purple-200">Download</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-sm text-purple-200">Total</span>
          </div>
        </div>

        {/* Main Chart */}
        <div className="h-64 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatTime}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#C4B5FD', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#totalGradient)"
                animationDuration={0}
              />
              <Area
                type="monotone"
                dataKey="upload"
                stroke="#EC4899"
                strokeWidth={2}
                fill="url(#uploadGradient)"
                animationDuration={0}
              />
              <Area
                type="monotone"
                dataKey="download"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#downloadGradient)"
                animationDuration={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Upload */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{uploadData.toFixed(1)} KB</div>
            <div className="flex items-center justify-center gap-1 text-purple-300">
              <ArrowDown className="w-4 h-4" />
              <span>{uploadSpeed.toFixed(0)} KB/s</span>
            </div>
          </div>

          {/* Total with circular progress */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#circleGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(totalData / 1000) * 314} 314`}
                />
                <defs>
                  <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalData.toFixed(1)} KB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Download */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{downloadData.toFixed(1)} KB</div>
            <div className="flex items-center justify-center gap-1 text-purple-300">
              <ArrowUp className="w-4 h-4" />
              <span>{downloadSpeed.toFixed(0)} KB/s</span>
            </div>
          </div>
        </div>

        {/* WAN/LAN Stats */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-300 text-sm">WAN</div>
              <div className="text-xl font-bold">{wanData.toFixed(1)} KB</div>
            </div>
            <div className="w-32 h-2 bg-purple-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (wanData / 800) * 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-300 text-sm">LAN</div>
              <div className="text-xl font-bold">{lanData.toFixed(1)} KB</div>
            </div>
            <div className="w-32 h-2 bg-purple-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (lanData / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
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

export default NetworkMonitor;