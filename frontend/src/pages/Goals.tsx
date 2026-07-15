import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map as MapIcon, Target, Activity, Plus, Trash2, Navigation, Footprints, Clock, Download } from 'lucide-react';
import api from '../api';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const MapEvents = ({ setDestination }: { setDestination: (pos: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setDestination([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

// Component to control map panning and fly-to animations
const MapController = ({ destination, currentPos }: { destination: [number, number] | null, currentPos: [number, number] }) => {
  const map = useMapEvents({});
  
  // Fly to destination when it is set via map tap or search
  useEffect(() => {
    if (destination) {
      map.flyTo(destination, 15);
    }
  }, [destination, map]);

  // Fly to current position when geolocation is updated initially
  useEffect(() => {
    if (currentPos && !destination) {
      map.flyTo(currentPos, 14);
    }
  }, [currentPos, map, destination]);
  
  return null;
};

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [activityType, setActivityType] = useState('WALKING');
  const [targetDistance, setTargetDistance] = useState('5');
  const [loading, setLoading] = useState(true);

  // Live Location & Routing States
  const [currentPos, setCurrentPos] = useState<[number, number]>([28.6129, 77.2295]);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [routeStats, setRouteStats] = useState<{ distKm: number, steps: number, durationMins: number } | null>(null);

  const fetchGoalsAndExercises = async () => {
    try {
      const [goalsRes, exRes] = await Promise.all([
        api.get('/api/goals'),
        api.get(`/api/exercise?date=${new Date().toISOString().split('T')[0]}`)
      ]);
      setGoals(goalsRes.data);
      setExercises(exRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndExercises();
    
    // Get Live Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch OSRM Route when destination changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!destination || !currentPos) return;
      try {
        const url = `https://router.project-osrm.org/route/v1/walking/${currentPos[1]},${currentPos[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // GeoJSON returns [lng, lat], Leaflet needs [lat, lng]
          const latLngPath = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          setRoutePath(latLngPath);
          
          const distKm = route.distance / 1000;
          const steps = Math.round(route.distance / 0.76); // Avg step is 0.76 meters
          const durationMins = Math.round(route.duration / 60);
          
          setRouteStats({ distKm, steps, durationMins });
        }
      } catch (err) {
        console.error("OSRM Error:", err);
      }
    };
    fetchRoute();
  }, [destination, currentPos]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setDestination([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("Location not found. Please try a different search.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching for location.");
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDistance) return;
    try {
      await api.post('/api/goals', {
        activityType,
        targetDistanceKm: parseFloat(targetDistance),
        timeframe: 'DAILY'
      });
      fetchGoalsAndExercises();
      setTargetDistance('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.delete(`/api/goals/${id}`);
      fetchGoalsAndExercises();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateProgress = (goal: any) => {
    const achieved = exercises
      .filter(ex => ex.exerciseType === goal.activityType)
      .reduce((acc, curr) => acc + (curr.distanceKm || 0), 0);
    const percent = Math.min(100, (achieved / goal.targetDistanceKm) * 100);
    return { achieved, percent };
  };

  const handleDownload = () => {
    let csv = "--- ACTIVE GOALS ---\nActivity,Target Distance (km),Achieved Distance (km),Progress (%)\n";
    goals.forEach(g => {
      const { achieved, percent } = calculateProgress(g);
      csv += `${g.activityType},${g.targetDistanceKm},${achieved.toFixed(2)},${percent.toFixed(1)}%\n`;
    });
    
    csv += "\n--- TODAY'S LOGGED EXERCISES ---\nType,Duration (mins),Calories,Distance (km)\n";
    exercises.forEach(ex => {
      csv += `${ex.exerciseType},${ex.durationMinutes},${ex.caloriesBurned},${ex.distanceKm || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NutriTrack_Goals_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Active Goals & Routes</h2>
        <p className="text-slate-400 text-sm">Set distance goals and visualize your daily activity path.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goals List & Form */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass p-6 rounded-3xl border border-slate-800">
            <h3 className="font-extrabold text-base mb-6 text-slate-300">Set New Target</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Activity</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                >
                  <option value="RUNNING" className="bg-slate-900">Running</option>
                  <option value="WALKING" className="bg-slate-900">Walking</option>
                  <option value="CYCLING" className="bg-slate-900">Cycling</option>
                  <option value="SWIMMING" className="bg-slate-900">Swimming</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily Distance (km)</label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="number"
                    step="0.1"
                    value={targetDistance}
                    onChange={(e) => setTargetDistance(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                    placeholder="e.g. 5"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 font-bold rounded-xl shadow-glass shadow-orange-500/20 transition duration-200"
              >
                <Plus size={16} />
                <span>Create Goal</span>
              </button>
            </form>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-300">Your Active Goals</h3>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-4 text-slate-500 text-sm">Loading...</div>
            ) : goals.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                No active goals. Set one above!
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map(goal => {
                  const { achieved, percent } = calculateProgress(goal);
                  return (
                    <div key={goal._id} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-orange-400" />
                          <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wide">
                            {goal.activityType}
                          </h4>
                        </div>
                        <button 
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>{achieved.toFixed(1)} km</span>
                        <span>{goal.targetDistanceKm} km</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${percent >= 100 ? 'bg-green-400' : 'bg-orange-400'} transition-all duration-1000 ease-out`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      {percent >= 100 && (
                        <p className="text-green-400 text-xs mt-2 font-semibold">Goal Achieved! 🎉</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map Visualization */}
        <div className="lg:col-span-2 glass rounded-3xl border border-slate-800 overflow-hidden relative flex flex-col min-h-[600px]">
          <div className="p-6 pb-4 bg-slate-900/80 backdrop-blur-md absolute top-0 left-0 right-0 z-[1000] border-b border-slate-800 flex flex-col gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-200">Live Routing & Steps Estimator</h3>
              <p className="text-xs text-slate-400 mt-1">Tap the map or search for a place to set a destination.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where would you like to go?" 
                className="flex-1 bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl px-6 py-2.5 text-sm transition shadow-lg shadow-blue-500/20">
                Search
              </button>
            </form>
            
            
            {routeStats && (
              <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-blue-400" />
                  <span className="font-bold text-sm text-slate-200">{routeStats.distKm.toFixed(2)} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Footprints size={16} className="text-orange-400" />
                  <span className="font-bold text-sm text-slate-200">{routeStats.steps.toLocaleString()} Steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-green-400" />
                  <span className="font-bold text-sm text-slate-200">{routeStats.durationMins} Mins</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative z-0">
            {typeof window !== 'undefined' && currentPos && (
              <MapContainer 
                center={currentPos} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  attribution='&copy; Google Maps'
                />
                
                <MapEvents setDestination={setDestination} />
                <MapController destination={destination} currentPos={currentPos} />

                <Marker position={currentPos}>
                  <Popup>📍 You Are Here</Popup>
                </Marker>

                {destination && (
                  <Marker position={destination}>
                    <Popup>🏁 Destination</Popup>
                  </Marker>
                )}

                {routePath.length > 0 && (
                  <Polyline 
                    positions={routePath} 
                    color="#3b82f6" // Blue-500
                    weight={6}
                    opacity={0.8}
                  />
                )}
              </MapContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Goals;
