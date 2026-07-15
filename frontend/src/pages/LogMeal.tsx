import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Trash2, Camera, Scan, Sparkles, X, ChevronRight, CheckCircle2, Sliders 
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      fetchCatalog();
      return;
    }
    try {
      const res = await api.get(`/api/foods?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
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
          <h2 className="text-3xl font-extrabold tracking-tight">Log a Meal</h2>
          <p className="text-slate-400 text-sm">Add food from catalog, favorites, barcode scanner, or photo recognition.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2.5 glass hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition"
          >
            <Scan size={14} />
            <span>Scan Barcode</span>
          </button>
          <button 
            onClick={() => setShowPhotoRecognizer(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-xs font-bold rounded-xl shadow-glass shadow-green-500/10 transition"
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
          <div className="glass p-6 rounded-3xl border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-base text-slate-300">Staged Meal Items</h3>
              
              <select 
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="MORNING_SNACK">Morning Snack</option>
                <option value="LUNCH">Lunch</option>
                <option value="EVENING_SNACK">Evening Snack</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                <Plus className="text-slate-600 mx-auto mb-3" size={32} />
                <p className="text-slate-400 text-sm font-medium">Staging list is empty.</p>
                <p className="text-xs text-slate-500 mt-1">Search or scan foods to stage them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedItems.map(item => (
                  <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                        <p className="text-xs text-slate-500">{item.brand}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/50"
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
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
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
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 text-xs rounded text-center text-slate-100 focus:outline-none focus:border-green-500"
                        />
                        <select
                          value={item.unitMultiplier}
                          onChange={(e) => {
                            const option = e.target.options[e.target.selectedIndex];
                            handleUpdateQuantity(item.id, item.quantity, option.text, parseFloat(e.target.value));
                          }}
                          className="px-2 py-1 bg-slate-900 border border-slate-800 text-xs rounded text-slate-100 focus:outline-none focus:border-green-500 max-w-[120px] truncate"
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

                    <div className="text-[11px] text-slate-400 pt-1 flex gap-4">
                      <span>Cal: {Math.round(item.calories * ((item.quantity * item.unitMultiplier) / 100))}</span>
                      <span>P: {Math.round(item.protein * ((item.quantity * item.unitMultiplier) / 100))}g</span>
                      <span>C: {Math.round(item.carbs * ((item.quantity * item.unitMultiplier) / 100))}g</span>
                      <span>F: {Math.round(item.fat * ((item.quantity * item.unitMultiplier) / 100))}g</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staged Nutrition Summary Panel */}
          {selectedItems.length > 0 && (
            <div className="glass p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/60 to-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="grid grid-cols-4 gap-4 md:gap-8 flex-1">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Calories</p>
                  <p className="text-lg font-extrabold text-green-400 mt-1">{Math.round(totalStaged.calories)} kcal</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Protein</p>
                  <p className="text-lg font-extrabold text-emerald-400 mt-1">{Math.round(totalStaged.protein)}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Carbs</p>
                  <p className="text-lg font-extrabold text-blue-400 mt-1">{Math.round(totalStaged.carbs)}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Fats</p>
                  <p className="text-lg font-extrabold text-amber-400 mt-1">{Math.round(totalStaged.fat)}g</p>
                </div>
              </div>

              <button
                onClick={handleSaveMeal}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl shadow-glass shadow-green-500/20 transition duration-200"
              >
                Log Meal to Diary
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Food Search catalog */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800">
            <h3 className="font-extrabold text-base mb-4 text-slate-300">Food Search</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                placeholder="Search apple, egg, rolled oats..."
              />
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {searchResults.map(food => (
                <div key={food.id} className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-slate-200 truncate">{food.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{food.brand || 'Generic'} - {food.servingSize}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => handleToggleFavorite(food.id)}
                      className={`text-sm ${favorites.some(f => f.id === food.id) ? 'text-red-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      ♥
                    </button>
                    <button
                      onClick={() => handleAddItem(food)}
                      className="p-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6">No matches found.</p>
              )}
            </div>
          </div>

          {/* Quick Favorites Log */}
          <div className="glass p-6 rounded-3xl border border-slate-800">
            <h3 className="font-extrabold text-sm mb-4 text-slate-300">Favorite Foods</h3>
            <div className="space-y-3">
              {favorites.map(food => (
                <div key={food.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium truncate pr-4">{food.name}</span>
                  <button
                    onClick={() => handleAddItem(food)}
                    className="text-xs text-green-400 font-semibold hover:underline flex items-center"
                  >
                    <span>Log</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              ))}
              {favorites.length === 0 && (
                <p className="text-[11px] text-slate-500">No favorite foods logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal Simulation */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowScanner(false)}></div>
          <div className="w-full max-w-md glass p-6 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-200">Barcode Lookup Scanner</h3>
              <button onClick={() => setShowScanner(false)} className="p-1 hover:bg-slate-800 rounded-lg"><X size={18} /></button>
            </div>

            {/* Scanner Container */}
            <div id="reader" className="w-full bg-white text-slate-900 rounded-xl overflow-hidden"></div>

            {scannerError && (
              <p className="text-red-400 text-xs text-center font-medium bg-red-500/10 border border-red-500/20 py-2 rounded-xl">{scannerError}</p>
            )}

            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Scan Code (UPC / EAN)</label>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100 text-center font-mono"
                  placeholder="e.g. 045678901234, 001234567890"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl transition"
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPhotoRecognizer(false)}></div>
          <div className="w-full max-w-md glass p-6 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-200">AI Meal Photo Recognition</h3>
              <button onClick={() => setShowPhotoRecognizer(false)} className="p-1 hover:bg-slate-800 rounded-lg"><X size={18} /></button>
            </div>

            {!recognizedMeal ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  Upload a photo of your dinner plate, salad, or breakfast. The AI will segment the ingredients and estimate the macros.
                </p>

                <div className="h-44 border-2 border-dashed border-slate-800 hover:border-green-500/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploadingPhoto}
                  />
                  {uploadingPhoto ? (
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-slate-400 font-medium">AI Segmenting plate...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Camera className="text-slate-600 mx-auto" size={32} />
                      <p className="text-xs font-semibold text-slate-300">Click or Drag Image</p>
                      <p className="text-[10px] text-slate-500">Supports PNG, JPG (e.g. name containing 'salad' or 'egg')</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-green-400">{recognizedMeal.mealName}</h4>
                    <p className="text-[10px] text-slate-500">Estimated accuracy: {Math.round(recognizedMeal.confidenceScore * 100)}%</p>
                  </div>
                  <Sparkles className="text-green-400 animate-pulse" size={20} />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Cal</p>
                    <p className="text-xs font-bold text-slate-300">{recognizedMeal.estimatedCalories}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Prot</p>
                    <p className="text-xs font-bold text-slate-300">{recognizedMeal.estimatedProtein}g</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Carb</p>
                    <p className="text-xs font-bold text-slate-300">{recognizedMeal.estimatedCarbs}g</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Fat</p>
                    <p className="text-xs font-bold text-slate-300">{recognizedMeal.estimatedFat}g</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ingredients Detected:</h5>
                  <ul className="space-y-1 text-xs">
                    {recognizedMeal.itemsDetected.map((it: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRecognizedMeal(null)}
                    className="w-1/3 py-2.5 glass hover:bg-slate-800 text-xs font-semibold rounded-xl"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleAddRecognizedMeal}
                    className="w-2/3 py-2.5 bg-primary-500 hover:bg-primary-600 text-xs font-bold rounded-xl"
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
