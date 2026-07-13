import React, { useState, useEffect } from 'react';
import { 
  Plus, CheckCircle2, ChevronRight, ShoppingCart, ListChecks, BookOpen, Trash2, X, PlusCircle 
} from 'lucide-react';
import api from '../api';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  
  // Create Recipe modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDesc, setRecipeDesc] = useState('');
  const [recipeInst, setRecipeInst] = useState('');
  const [recipeCal, setRecipeCal] = useState(400);
  const [stagedIngredients, setStagedIngredients] = useState<string>(''); // comma-sep list like "Chicken:150g, Rice:100g"

  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<any>(null);

  const fetchRecipeData = async () => {
    try {
      const recRes = await api.get('/api/recipes');
      setRecipes(recRes.data);

      const listRes = await api.get('/api/shopping-list');
      setShoppingLists(listRes.data);
      if (listRes.data.length > 0) {
        setActiveList(listRes.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeData();
  }, []);

  const handleToggleSelectRecipe = (id: number) => {
    setSelectedRecipeIds(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleCompileList = async () => {
    if (selectedRecipeIds.length === 0) return;
    try {
      const res = await api.post('/api/recipes/generate-shopping-list', selectedRecipeIds);
      setShoppingLists(prev => [res.data, ...prev]);
      setActiveList(res.data);
      setSelectedRecipeIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (id: number) => {
    try {
      await api.delete(`/api/shopping-list/${id}`);
      const updated = shoppingLists.filter(l => l.id !== id);
      setShoppingLists(updated);
      if (activeList?.id === id) {
        setActiveList(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName) return;

    // Parse ingredients to RecipeIngredient entities
    const recipeIngredients = stagedIngredients.split(',').map(item => {
      const parts = item.split(':');
      const name = parts[0]?.trim() || "Ingredient";
      const qtyStr = parts[1] || "100g";
      const qty = parseFloat(qtyStr.replace(/[^0-9.]/g, '')) || 100.0;

      return {
        id: { recipeId: null, ingredientId: null },
        ingredient: { name, calories: 150, protein: 10, fat: 5, carbs: 15 },
        quantityG: qty
      };
    });

    try {
      const payload = {
        name: recipeName,
        description: recipeDesc,
        instructions: recipeInst,
        calories: recipeCal,
        protein: 30.0,
        carbs: 40.0,
        fat: 10.0,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        recipeIngredients
      };

      const res = await api.post('/api/recipes', payload);
      setRecipes(prev => [...prev, res.data]);
      setShowCreateModal(false);
      
      // Reset fields
      setRecipeName('');
      setRecipeDesc('');
      setRecipeInst('');
      setStagedIngredients('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs">Accessing recipe book...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Recipes & Grocery Planner</h2>
          <p className="text-slate-400 text-sm">Select recipes to compile a unified shopping list, or log custom meal formulas.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-xs font-bold rounded-xl shadow-glass shadow-green-500/20 transition"
        >
          <Plus size={14} />
          <span>New Recipe</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recipes Catalog (Checkbox Selection) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-base text-slate-300">Recipe Catalog</h3>
              
              {selectedRecipeIds.length > 0 && (
                <button
                  onClick={handleCompileList}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <ShoppingCart size={14} />
                  <span>Compile {selectedRecipeIds.length} Lists</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map(recipe => {
                const isSelected = selectedRecipeIds.includes(recipe.id);
                return (
                  <div 
                    key={recipe.id} 
                    className={`p-4 bg-slate-900/40 border rounded-2xl flex flex-col justify-between transition-all duration-300 ${isSelected ? 'border-primary-500 shadow-glass shadow-green-500/5 bg-primary-950/5' : 'border-slate-800/80 hover:border-slate-700'}`}
                  >
                    <div>
                      <div className="h-32 bg-slate-800 rounded-xl overflow-hidden mb-3 relative">
                        <img 
                          src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                          alt={recipe.name} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleToggleSelectRecipe(recipe.id)}
                          className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center border transition ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                          ✓
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-slate-200">{recipe.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{recipe.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400">
                      <span>{recipe.calories} kcal</span>
                      <span className="font-medium">
                        P: {recipe.protein}g | C: {recipe.carbs}g
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grocery list panel */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800">
            <h3 className="font-extrabold text-base mb-6 text-slate-300">Grocery Planner</h3>

            {shoppingLists.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                <ListChecks className="text-slate-600 mx-auto mb-3" size={32} />
                <p className="text-slate-400 text-xs font-semibold">Shopping list is empty.</p>
                <p className="text-[10px] text-slate-500 mt-1">Check recipes on the left to compile ingredients.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Active List</label>
                  <select
                    value={activeList?.id || ''}
                    onChange={(e) => setActiveList(shoppingLists.find(l => l.id === parseInt(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold"
                  >
                    {shoppingLists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>

                {activeList && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-400">Ingredient Checklist</span>
                      <button 
                        onClick={() => handleDeleteList(activeList.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {activeList.items.split(',').map((it: string, idx: number) => {
                        const parts = it.split(':');
                        const name = parts[0];
                        const qty = parts[1] || '';
                        return (
                          <label key={idx} className="flex items-center gap-2.5 p-2 bg-slate-900/30 border border-slate-850 rounded-xl cursor-pointer hover:bg-slate-900/50">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-800 text-primary-500 focus:ring-0 accent-green-500" />
                            <span className="text-xs text-slate-300 font-medium">
                              {name} <span className="text-slate-500 font-normal">({qty})</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Recipe Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="w-full max-w-lg glass p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-200">Create Custom Recipe</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-800 rounded-lg"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipe Name</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="e.g. Garlic Chicken Pasta"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Short Description</label>
                <input
                  type="text"
                  value={recipeDesc}
                  onChange={(e) => setRecipeDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="e.g. High protein, balanced macro dinner prep"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Staged Ingredients (Format: Name:Qty,...)</label>
                  <input
                    type="text"
                    value={stagedIngredients}
                    onChange={(e) => setStagedIngredients(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                    placeholder="e.g. Chicken:150g,Broccoli:100g"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Estimated Calories (kcal)</label>
                  <input
                    type="number"
                    value={recipeCal}
                    onChange={(e) => setRecipeCal(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Instructions / Steps</label>
                <textarea
                  value={recipeInst}
                  onChange={(e) => setRecipeInst(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="1. Boil pasta. 2. Grill chicken..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl"
              >
                Compile Recipe to Book
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
