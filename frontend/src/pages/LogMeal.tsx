import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Trash2, Camera, Scan, Sparkles, X, ChevronRight, CheckCircle2, Sliders 
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

interface LoggedItem {
  id: number;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number; // The user-facing number (e.g., 2)
  servingUnit: string; // "Grams", "Small Katori", "Medium Katori", etc.
  unitMultiplier: number; // How many grams per unit
}

const LogMeal: React.FC = () => {
  const [mealType, setMealType] = useState('BREAKFAST');
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<LoggedItem[]>([]);
  
  // Scanner Modal Simulation
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerError, setScannerError] = useState('');

  // Image recognition state
  const [showPhotoRecognizer, setShowPhotoRecognizer] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [recognizedMeal, setRecognizedMeal] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial favorites & full catalog
    fetchCatalog();
    fetchFavorites();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/api/foods');
      setSearchResults(res.data.slice(0, 5)); // Initial search results
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/api/foods/favorites');
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        fetchCatalog();
        return;
      }
      try {
        const res = await api.get(`/api/foods?q=${debouncedQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleFavorite = async (foodId: number) => {
    try {
      await api.post(`/api/foods/${foodId}/favorite`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = (food: any) => {
    const foodId = food._id || food.id;
    // Check if food already in staged items
    const exists = selectedItems.find(item => item.id === foodId);
    if (exists) return;

    setSelectedItems(prev => [
      ...prev,
      {
        id: foodId,
        name: food.name,
        brand: food.brand || 'Generic',
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbohydrates,
        fat: food.fat,
        quantity: 1,
        servingUnit: 'Medium Katori (150g)',
        unitMultiplier: 150
      }
    ]);
  };

  const handleUpdateQuantity = (foodId: number, qty: number, unit?: string, multiplier?: number) => {
    setSelectedItems(prev =>
      prev.map(item => {
        if (item.id === foodId) {
          return { 
            ...item, 
            quantity: Math.max(0.1, qty), 
            servingUnit: unit || item.servingUnit,
            unitMultiplier: multiplier || item.unitMultiplier
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (foodId: number) => {
    setSelectedItems(prev => prev.filter(item => item.id !== foodId));
  };

  // Barcode Lookup Simulation
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScannerError('');
    if (!barcodeInput.trim()) return;

    try {
      const res = await api.get(`/api/foods/barcode/${barcodeInput}`);
      handleAddItem(res.data);
      setShowScanner(false);
      setBarcodeInput('');
    } catch (err) {
      setScannerError('Barcode not found in Open Food Facts. Try manual input or another product.');
    }
  };

  // Setup live barcode scanner when modal opens
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 100 } },
        false
      );

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setBarcodeInput(decodedText);
          
          try {
            const res = await api.get(`/api/foods/barcode/${decodedText}`);
            handleAddItem(res.data);
            setShowScanner(false);
            setBarcodeInput('');
          } catch (err) {
            setScannerError('Barcode not found in Open Food Facts.');
          }
        },
        (error) => {
          // ignore frequent scan failures
        }
      );

      return () => {
        scanner.clear().catch(e => console.error(e));
      };
    }
    return undefined;
  }, [showScanner]);

  // Photo recognition simulation
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingPhoto(true);
    setRecognizedMeal(null);

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/ai/recognize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRecognizedMeal(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddRecognizedMeal = async () => {
    if (!recognizedMeal) return;
    try {
      // Find or create food item for the recognized meal.
      // For simplicity in UI presentation, we append a new temporary food item or mock log.
      // Let's create a custom food item:
      const customFood = {
        name: recognizedMeal.mealName,
        brand: "AI Recognizer",
        calories: recognizedMeal.estimatedCalories,
        protein: recognizedMeal.estimatedProtein,
        carbohydrates: recognizedMeal.estimatedCarbs,
        fat: recognizedMeal.estimatedFat,
        servingSize: "1 plate",
        ingredients: recognizedMeal.itemsDetected.join(', ')
      };

      const foodRes = await api.post('/api/foods', customFood);
      handleAddItem(foodRes.data);
      setShowPhotoRecognizer(false);
      setRecognizedMeal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMeal = async () => {
    if (selectedItems.length === 0) return;
    try {
      const payload = {
        date,
        mealType,
        items: selectedItems.map(item => ({
          foodId: item.id,
          quantityG: item.quantity * item.unitMultiplier
        }))
      };
      await api.post('/api/meals', payload);
      navigate('/dashboard/home');
    } catch (err) {
      console.error(err);
    }
  };

  // Summarize staged nutrition
  const totalStaged = selectedItems.reduce(
    (acc, item) => {
      const factor = (item.quantity * item.unitMultiplier) / 100;
      return {
        calories: acc.calories + item.calories * factor,
        protein: acc.protein + item.protein * factor,
        carbs: acc.carbs + item.carbs * factor,
        fat: acc.fat + item.fat * factor
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Log a Meal</h2>
          <p className="text-slate-500 text-sm mt-1 font-semibold">Add food from catalog, favorites, barcode scanner, or photo recognition.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2.5 glass hover:bg-white/70 border border-slate-300 text-xs font-bold text-slate-700 active:scale-95 transition-all duration-200"
          >
            <Scan size={14} />
            <span>Scan Barcode</span>
          </button>
          <button 
            onClick={() => setShowPhotoRecognizer(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-card active:scale-95 transition-all duration-200"
          >
            <Camera size={14} />
            <span>Identify Meal Photo</span>
          </button>
        </div>
      </div>

      {/* Selector & Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Staging Cart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-base text-slate-800">Staged Meal Items</h3>
              
              <select 
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/45 border border-slate-300 text-slate-850 text-xs font-bold glass-input focus:outline-none"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="MORNING_SNACK">Morning Snack</option>
                <option value="LUNCH">Lunch</option>
                <option value="EVENING_SNACK">Evening Snack</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>

            <div className="relative min-h-[140px]">
              <AnimatePresence mode="wait">
                {selectedItems.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-center py-16 border border-dashed border-slate-300 rounded-2xl bg-white/20"
                  >
                    <Plus className="text-slate-600 mx-auto mb-3" size={32} />
                    <p className="text-slate-600 text-sm font-bold">Staging list is empty.</p>
                    <p className="text-xs text-slate-500 mt-1.5 font-semibold">Search or scan foods to stage them.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <AnimatePresence initial={false}>
                      {selectedItems.map(item => {
                        const percentage = ((item.quantity - 0.5) / (10 - 0.5)) * 100;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            layout
                            className="p-4 bg-white/40 border border-white/30 rounded-2xl space-y-3 shadow-sm hover:bg-white/60 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-bold text-sm text-slate-850">{item.name}</h4>
                                <p className="text-xs text-slate-500 font-bold">{item.brand}</p>
                              </div>
                              <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-primary-50/50 transition-all duration-200"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="flex items-center gap-2 w-full sm:w-1/2">
                                <Sliders className="text-slate-500 flex-shrink-0" size={14} />
                                <input
                                  type="range"
                                  min="0.5"
                                  max="10"
                                  step="0.5"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(item.id, parseFloat(e.target.value))}
                                  className="custom-slider"
                                  style={{
                                    background: `linear-gradient(to right, #FF9E8A 0%, #FF9E8A ${percentage}%, #FFE3D4 ${percentage}%, #FFE3D4 100%)`
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2 w-full sm:w-1/2 text-right">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  max="50"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 glass-input border border-slate-300 text-xs rounded text-center text-slate-850 font-bold focus:outline-none focus:border-primary-500"
                                />
                                <select
                                  value={item.unitMultiplier}
                                  onChange={(e) => {
                                    const option = e.target.options[e.target.selectedIndex];
                                    handleUpdateQuantity(item.id, item.quantity, option.text, parseFloat(e.target.value));
                                  }}
                                  className="px-2 py-1 glass-input border border-slate-300 text-xs rounded text-slate-850 font-semibold focus:outline-none focus:border-primary-500 max-w-[120px] truncate"
                                >
                                  <option value="1">Grams</option>
                                  <option value="100">Small Katori</option>
                                  <option value="150">Medium Katori</option>
                                  <option value="200">Large Katori</option>
                                  <option value="250">Bowl</option>
                                  <option value="40">Piece</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-white/20">
                              <div className="bg-primary-50/60 p-2 rounded-xl text-center shadow-sm">
                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">Calories</span>
                                <motion.span
                                  key={item.quantity * item.unitMultiplier + '-cal'}
                                  initial={{ scale: 0.85, color: '#FF9E8A' }}
                                  animate={{ scale: 1, color: '#B56A45' }}
                                  className="block text-xs font-extrabold"
                                >
                                  {Math.round(item.calories * ((item.quantity * item.unitMultiplier) / 100))}
                                </motion.span>
                              </div>
                              <div className="bg-emerald-50/60 p-2 rounded-xl text-center shadow-sm">
                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">Protein</span>
                                <motion.span
                                  key={item.quantity * item.unitMultiplier + '-prot'}
                                  initial={{ scale: 0.85, color: '#6fc29d' }}
                                  animate={{ scale: 1, color: '#2E7D5C' }}
                                  className="block text-xs font-extrabold"
                                >
                                  {Math.round(item.protein * ((item.quantity * item.unitMultiplier) / 100))}g
                                </motion.span>
                              </div>
                              <div className="bg-blue-50/60 p-2 rounded-xl text-center shadow-sm">
                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">Carbs</span>
                                <motion.span
                                  key={item.quantity * item.unitMultiplier + '-carbs'}
                                  initial={{ scale: 0.85, color: '#81b5ca' }}
                                  animate={{ scale: 1, color: '#366E87' }}
                                  className="block text-xs font-extrabold"
                                >
                                  {Math.round(item.carbs * ((item.quantity * item.unitMultiplier) / 100))}g
                                </motion.span>
                              </div>
                              <div className="bg-orange-50/60 p-2 rounded-xl text-center shadow-sm">
                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">Fat</span>
                                <motion.span
                                  key={item.quantity * item.unitMultiplier + '-fat'}
                                  initial={{ scale: 0.85, color: '#FFD2BD' }}
                                  animate={{ scale: 1, color: '#C2673D' }}
                                  className="block text-xs font-extrabold"
                                >
                                  {Math.round(item.fat * ((item.quantity * item.unitMultiplier) / 100))}g
                                </motion.span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Staged Nutrition Summary Panel */}
          {selectedItems.length > 0 && (
            <div className="glass p-6 rounded-3xl border border-white/50 bg-white/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="grid grid-cols-4 gap-4 md:gap-8 flex-1">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Calories</p>
                  <p className="text-lg font-extrabold text-primary-655 mt-1">{Math.round(totalStaged.calories)} kcal</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Protein</p>
                  <p className="text-lg font-extrabold text-emerald-600 mt-1">{Math.round(totalStaged.protein)}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Carbs</p>
                  <p className="text-lg font-extrabold text-blue-650 mt-1">{Math.round(totalStaged.carbs)}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Fats</p>
                  <p className="text-lg font-extrabold text-primary-600 mt-1">{Math.round(totalStaged.fat)}g</p>
                </div>
              </div>

              <button
                onClick={handleSaveMeal}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition-all active:scale-95 duration-200"
              >
                Log Meal to Diary
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Food Search catalog */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm">
            <h3 className="font-extrabold text-base mb-4 text-slate-800">Food Search</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-850 font-bold"
                placeholder="Search global foods (e.g. apple, oats)..."
              />
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {searchResults.map(food => (
                <div key={food.id} className="p-3 bg-white/40 border border-white/30 rounded-xl flex items-center justify-between gap-3 hover:bg-white/60 transition duration-200">
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-slate-850 truncate">{food.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold truncate">{food.brand || 'Generic'} - {food.servingSize}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => handleToggleFavorite(food.id)}
                      className={`text-sm ${favorites.some(f => f.id === food.id) ? 'text-primary-600' : 'text-slate-550 hover:text-slate-700'}`}
                    >
                      ♥
                    </button>
                    <button
                      onClick={() => handleAddItem(food)}
                      className="p-1 bg-primary-100/50 text-primary-650 hover:bg-primary-100 hover:text-primary-700 border border-primary-200/50 rounded-lg transition-all active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6 font-bold">No matches found.</p>
              )}
            </div>
          </div>

          {/* Quick Favorites Log */}
          <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm">
            <h3 className="font-extrabold text-sm mb-4 text-slate-800">Favorite Foods</h3>
            <div className="space-y-3">
              {favorites.map(food => (
                <div key={food.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-bold truncate pr-4">{food.name}</span>
                  <button
                    onClick={() => handleAddItem(food)}
                    className="text-xs text-primary-600 font-bold hover:underline flex items-center active:scale-95 transition-all"
                  >
                    <span>Log</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              ))}
              {favorites.length === 0 && (
                <p className="text-[11px] text-slate-500 font-semibold">No favorite foods logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal Simulation */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#463F3A]/60 backdrop-blur-sm" onClick={() => setShowScanner(false)}></div>
          <div className="w-full max-w-md glass p-6 rounded-3xl border border-white/50 shadow-2xl relative z-10 space-y-6 bg-white/95 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-850">Barcode Lookup Scanner</h3>
              <button onClick={() => setShowScanner(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>

            {/* Scanner Container */}
            <div id="reader" className="w-full bg-white text-slate-900 rounded-xl overflow-hidden"></div>

            {scannerError && (
              <p className="text-red-650 text-xs text-center font-bold bg-red-50 border border-red-200 py-2 rounded-xl">{scannerError}</p>
            )}

            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-650 uppercase tracking-wider mb-2">Scan Code (UPC / EAN)</label>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-850 text-center font-mono font-bold"
                  placeholder="e.g. 045678901234, 001234567890"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl active:scale-95 transition-all duration-200"
              >
                Query Product Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Photo recognizer Modal */}
      {showPhotoRecognizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#463F3A]/60 backdrop-blur-sm" onClick={() => setShowPhotoRecognizer(false)}></div>
          <div className="w-full max-w-md glass p-6 rounded-3xl border border-white/50 shadow-2xl relative z-10 space-y-6 bg-white/95 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-850">AI Meal Photo Recognition</h3>
              <button onClick={() => setShowPhotoRecognizer(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>

            {!recognizedMeal ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed text-center font-semibold">
                  Upload a photo of your dinner plate, salad, or breakfast. The AI will segment the ingredients and estimate the macros.
                </p>

                <div className="h-44 border-2 border-dashed border-slate-300 hover:border-primary-500/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploadingPhoto}
                  />
                  {uploadingPhoto ? (
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-slate-600 font-semibold">AI Segmenting plate...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Camera className="text-slate-600 mx-auto" size={32} />
                      <p className="text-xs font-bold text-slate-800">Click or Drag Image</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Supports PNG, JPG (e.g. name containing 'salad' or 'egg')</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-700">{recognizedMeal.mealName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Estimated accuracy: {Math.round(recognizedMeal.confidenceScore * 100)}%</p>
                  </div>
                  <Sparkles className="text-emerald-500 animate-pulse" size={20} />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-white/40 p-3 rounded-xl border border-white/30 shadow-sm">
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Cal</p>
                    <p className="text-xs font-extrabold text-slate-850">{recognizedMeal.estimatedCalories}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Prot</p>
                    <p className="text-xs font-extrabold text-slate-850">{recognizedMeal.estimatedProtein}g</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Carb</p>
                    <p className="text-xs font-extrabold text-slate-850">{recognizedMeal.estimatedCarbs}g</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Fat</p>
                    <p className="text-xs font-extrabold text-slate-850">{recognizedMeal.estimatedFat}g</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Ingredients Detected:</h5>
                  <ul className="space-y-1 text-xs">
                    {recognizedMeal.itemsDetected.map((it: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 font-semibold">
                        <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRecognizedMeal(null)}
                    className="w-1/3 py-2.5 glass hover:bg-white/70 text-xs font-bold text-slate-700 active:scale-95 transition-all duration-200"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleAddRecognizedMeal}
                    className="w-2/3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all duration-200"
                  >
                    Stage Detected Food
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogMeal;
