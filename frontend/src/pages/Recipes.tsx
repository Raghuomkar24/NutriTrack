import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ShoppingCart, X, Check, ChefHat, Search,
  Sparkles, Trash2, ListChecks, Package, Leaf, Egg, Milk, ShoppingBag
} from 'lucide-react';
import api from '../api';
import { useAlert } from '../context/AlertContext';

// ─── Ingredient category assignment ──────────────────────────────────────────
const CATEGORIES = ['Proteins', 'Produce', 'Dairy', 'Pantry'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Proteins: <Egg size={14} />,
  Produce:  <Leaf size={14} />,
  Dairy:    <Milk size={14} />,
  Pantry:   <Package size={14} />,
};

const CATEGORY_COLORS: Record<Category, { bg: string; border: string; text: string; chip: string }> = {
  Proteins: { bg: 'bg-rose-50/70',   border: 'border-rose-200',   text: 'text-rose-700',   chip: 'bg-rose-100 text-rose-700' },
  Produce:  { bg: 'bg-emerald-50/70',border: 'border-emerald-200',text: 'text-emerald-700', chip: 'bg-emerald-100 text-emerald-700' },
  Dairy:    { bg: 'bg-blue-50/70',   border: 'border-blue-200',   text: 'text-blue-700',   chip: 'bg-blue-100 text-blue-700' },
  Pantry:   { bg: 'bg-amber-50/70',  border: 'border-amber-200',  text: 'text-amber-700',  chip: 'bg-amber-100 text-amber-700' },
};

const PROTEIN_KEYWORDS  = ['chicken', 'beef', 'fish', 'salmon', 'tuna', 'egg', 'paneer', 'tofu', 'lentil', 'dal', 'mutton', 'pork', 'shrimp', 'prawn', 'turkey'];
const PRODUCE_KEYWORDS  = ['broccoli', 'onion', 'tomato', 'spinach', 'carrot', 'capsicum', 'pepper', 'lettuce', 'cucumber', 'garlic', 'ginger', 'lemon', 'vegetable', 'fruit', 'apple', 'banana'];
const DAIRY_KEYWORDS    = ['milk', 'cheese', 'yogurt', 'curd', 'butter', 'cream', 'ghee', 'paneer'];

function classifyIngredient(name: string): Category {
  const lower = name.toLowerCase();
  if (PROTEIN_KEYWORDS.some(k => lower.includes(k))) return 'Proteins';
  if (DAIRY_KEYWORDS.some(k => lower.includes(k)))   return 'Dairy';
  if (PRODUCE_KEYWORDS.some(k => lower.includes(k))) return 'Produce';
  return 'Pantry';
}

// ─── Compiler Engine: aggregate + categorize from selected recipes ────────────
interface GroceryItem {
  name: string;
  amountG: number;
  category: Category;
}

function compileGroceryList(recipes: any[], selectedIds: string[]): Record<Category, GroceryItem[]> {
  const selected = recipes.filter(r => selectedIds.includes(r.id));
  const map: Record<string, { amountG: number; category: Category }> = {};

  selected.forEach(recipe => {
    (recipe.recipeIngredients || []).forEach((item: any) => {
      const name = item.ingredient?.name || 'Unknown';
      const qty  = item.quantityG || 0;
      if (map[name]) {
        map[name].amountG += qty;
      } else {
        map[name] = { amountG: qty, category: classifyIngredient(name) };
      }
    });
  });

  const result: Record<Category, GroceryItem[]> = { Proteins: [], Produce: [], Dairy: [], Pantry: [] };
  Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([name, { amountG, category }]) => {
      result[category].push({ name, amountG, category });
    });

  return result;
}

// ─── Animation variants ───────────────────────────────────────────────────────
const drawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit:   { x: '100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

const checkboxPopVariants = {
  rest:    { scale: 1 },
  checked: { scale: [1, 1.35, 1], transition: { duration: 0.35, times: [0, 0.5, 1], ease: 'easeOut' } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 } }),
};

// ─── Component ────────────────────────────────────────────────────────────────
const Recipes: React.FC = () => {
  const { showAlert, confirmDelete } = useAlert();

  // ── Data state
  const [recipes, setRecipes]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── Grocery drawer
  const [isPanelOpen, setIsPanelOpen]   = useState(false);
  const [crossedOff, setCrossedOff]     = useState<string[]>([]);
  const [compiledList, setCompiledList] = useState<Record<Category, GroceryItem[]> | null>(null);

  // ── Saved shopping lists (history)
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);

  // ── Create Recipe modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recipeName,      setRecipeName]      = useState('');
  const [recipeDesc,      setRecipeDesc]      = useState('');
  const [recipeInst,      setRecipeInst]      = useState('');
  const [recipeCal,       setRecipeCal]       = useState(400);
  const [recipeProtein,   setRecipeProtein]   = useState(30);
  const [recipeCarbs,     setRecipeCarbs]     = useState(40);
  const [recipeFat,       setRecipeFat]       = useState(10);
  const [stagedIngredients, setStagedIngredients] = useState('');

  // ── Fetch
  const fetchData = useCallback(async () => {
    try {
      const [recRes, listRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/shopping-list'),
      ]);
      setRecipes(recRes.data);
      setShoppingLists(listRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered recipes
  const filteredRecipes = useMemo(() =>
    recipes.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [recipes, searchQuery]
  );

  // ── Toggle recipe selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // ── Compile grocery list (frontend engine)
  const handleCompile = () => {
    if (selectedIds.length === 0) return;
    const list = compileGroceryList(recipes, selectedIds);
    setCompiledList(list);
    setCrossedOff([]);
    setIsPanelOpen(true);
  };

  // ── Save compiled list to DB
  const handleSaveList = async () => {
    if (!compiledList) return;
    try {
      await api.post('/api/recipes/generate-shopping-list', selectedIds);
      showAlert({ type: 'success', title: 'List Saved', body: 'Your shopping list has been saved beautifully.' });
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Clear compiled list
  const handleClearList = async () => {
    const ok = await confirmDelete({
      title: 'Clear Shopping List?',
      body: 'This will remove all current compiled items.',
    });
    if (!ok) return;
    setCompiledList(null);
    setCrossedOff([]);
    setIsPanelOpen(false);
    showAlert({ type: 'delete', title: 'List Cleared', body: 'The log has been permanently cleared.' });
  };

  // ── Delete saved list
  const handleDeleteSavedList = async (id: string) => {
    const ok = await confirmDelete({ title: 'Remove Saved List?', body: 'This action cannot be undone.' });
    if (!ok) return;
    try {
      await api.delete(`/api/shopping-list/${id}`);
      showAlert({ type: 'delete', title: 'List Removed', body: 'The log has been permanently cleared.' });
      setShoppingLists(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Cross-off a grocery item
  const handleCrossOff = (key: string) => {
    setCrossedOff(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  };

  // ── Create recipe
  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName) return;
    const recipeIngredients = stagedIngredients.split(',').map(item => {
      const parts = item.split(':');
      const name = parts[0]?.trim() || 'Ingredient';
      const qty  = parseFloat((parts[1] || '100').replace(/[^0-9.]/g, '')) || 100;
      return { ingredient: { name, calories: 100, protein: 8, fat: 4, carbs: 12 }, quantityG: qty };
    }).filter(x => x.ingredient.name);

    try {
      const payload = {
        name: recipeName, description: recipeDesc, instructions: recipeInst,
        calories: recipeCal, protein: recipeProtein, carbs: recipeCarbs, fat: recipeFat,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        recipeIngredients,
      };
      const res = await api.post('/api/recipes', payload);
      setRecipes(prev => [res.data, ...prev]);
      setShowCreateModal(false);
      setRecipeName(''); setRecipeDesc(''); setRecipeInst(''); setStagedIngredients('');
      setRecipeCal(400); setRecipeProtein(30); setRecipeCarbs(40); setRecipeFat(10);
      showAlert({ type: 'success', title: 'Recipe Added', body: 'Recipe Added Successfully.' });
    } catch (err) {
      console.error(err);
    }
  };

  const totalItems = compiledList
    ? Object.values(compiledList).reduce((s, arr) => s + arr.length, 0)
    : 0;
  const crossedCount = crossedOff.length;

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-semibold">Loading recipe book...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Recipes & Grocery Planner</h2>
          <p className="text-slate-500 text-sm mt-1 font-semibold">
            Select recipes to compile a smart grocery list with auto-categorisation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleCompile}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all duration-200"
            >
              <ShoppingCart size={14} />
              <span>Compile {selectedIds.length} Recipe{selectedIds.length > 1 ? 's' : ''}</span>
            </motion.button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-card active:scale-95 transition-all duration-200"
          >
            <Plus size={14} />
            <span>New Recipe</span>
          </button>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-bold text-slate-800 placeholder-slate-400"
          placeholder="Search recipes by name or description..."
        />
      </div>

      {/* ── Recipe Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-3 glass rounded-3xl py-16 flex flex-col items-center text-center border border-white/50">
            <ChefHat size={40} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold text-sm">No recipes found.</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">Try a different search or create a new recipe.</p>
          </div>
        ) : filteredRecipes.map((recipe, i) => {
          const isSelected = selectedIds.includes(recipe.id);
          return (
            <motion.div
              key={recipe.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={`
                glass rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer group
                ${isSelected
                  ? 'border-emerald-400/70 shadow-[0_0_0_2px_rgba(52,211,153,0.25),0_20px_40px_rgba(52,211,153,0.1)]'
                  : 'border-white/50 hover:border-white/70'}
              `}
              onClick={() => handleToggleSelect(recipe.id)}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Selection badge */}
                <div className={`
                  absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all duration-200
                  ${isSelected
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg'
                    : 'bg-white/60 border-white/80 text-transparent backdrop-blur-sm'}
                `}>
                  <Check size={14} strokeWidth={3} />
                </div>
                {/* Category chips */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {(Array.from(new Set((recipe.recipeIngredients || []).map((ing: any) => classifyIngredient(ing.ingredient?.name || '')))) as Category[]).slice(0,2).map((cat) => {
                    const c = CATEGORY_COLORS[cat];
                    return (
                      <span key={cat} className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${c.chip}`}>{cat}</span>
                    );
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{recipe.name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">{recipe.description}</p>

                {/* Macro row */}
                <div className="mt-4 pt-3 border-t border-white/40 grid grid-cols-4 gap-1 text-center">
                  {[
                    ['Cal', recipe.calories, 'kcal', 'text-primary-700'],
                    ['P',   recipe.protein,  'g',    'text-emerald-700'],
                    ['C',   recipe.carbs,    'g',    'text-blue-700'],
                    ['F',   recipe.fat,      'g',    'text-orange-700'],
                  ].map(([label, val, unit, cls]) => (
                    <div key={label as string}>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">{label}</p>
                      <p className={`text-xs font-extrabold mt-0.5 ${cls}`}>{val}<span className="text-[9px]">{unit}</span></p>
                    </div>
                  ))}
                </div>

                {/* Ingredients preview */}
                {(recipe.recipeIngredients || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {recipe.recipeIngredients.slice(0, 3).map((ing: any, idx: number) => (
                      <span key={idx} className="text-[9px] bg-white/50 border border-white/60 px-2 py-0.5 rounded-full text-slate-600 font-semibold">
                        {ing.ingredient?.name}
                      </span>
                    ))}
                    {recipe.recipeIngredients.length > 3 && (
                      <span className="text-[9px] bg-white/30 border border-white/40 px-2 py-0.5 rounded-full text-slate-400 font-semibold">
                        +{recipe.recipeIngredients.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Saved Shopping Lists ────────────────────────────────────────────── */}
      {shoppingLists.length > 0 && (
        <div className="glass p-6 rounded-3xl border border-white/50">
          <h3 className="font-extrabold text-base text-slate-800 mb-4 flex items-center gap-2">
            <ListChecks size={18} className="text-primary-600" />
            Saved Grocery Lists
          </h3>
          <div className="space-y-3">
            {shoppingLists.map(list => (
              <div key={list.id} className="flex items-center justify-between p-3 bg-white/40 rounded-2xl border border-white/60">
                <div>
                  <p className="text-sm font-bold text-slate-800">{list.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(list.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSavedList(list.id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-[#C96A52] hover:bg-[rgba(255,168,150,0.15)] transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Grocery Drawer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPanelOpen && compiledList && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              variants={backdropVariants}
              initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9990] bg-black/15 backdrop-blur-[3px]"
              onClick={() => setIsPanelOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer-panel"
              variants={drawerVariants}
              initial="hidden" animate="visible" exit="exit"
              className="
                fixed top-0 right-0 bottom-0 z-[9991]
                w-full max-w-sm
                flex flex-col
                backdrop-blur-[22px] saturate-150
                bg-[rgba(255,255,255,0.28)]
                border-l border-[rgba(255,255,255,0.55)]
                shadow-[-20px_0_60px_rgba(181,106,69,0.12)]
              "
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/30">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary-600" />
                    Grocery List
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {crossedCount}/{totalItems} items collected
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/40 transition text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="px-6 pt-3">
                <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: totalItems > 0 ? `${(crossedCount / totalItems) * 100}%` : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Scrollable items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {CATEGORIES.map(cat => {
                  const items = compiledList[cat];
                  if (items.length === 0) return null;
                  const colors = CATEGORY_COLORS[cat];
                  return (
                    <div key={cat}>
                      {/* Category header */}
                      <div className={`flex items-center gap-2 mb-2.5 px-3 py-1.5 rounded-xl ${colors.bg} border ${colors.border}`}>
                        <span className={colors.text}>{CATEGORY_ICONS[cat]}</span>
                        <span className={`text-xs font-extrabold ${colors.text} uppercase tracking-wider`}>{cat}</span>
                        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors.chip}`}>
                          {items.filter(it => !crossedOff.includes(`${cat}:${it.name}`)).length} left
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {items.map(item => {
                          const key = `${cat}:${item.name}`;
                          const isCrossed = crossedOff.includes(key);
                          return (
                            <motion.label
                              key={key}
                              className={`
                                flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer
                                border transition-all duration-250
                                ${isCrossed
                                  ? 'bg-white/15 border-white/20 opacity-50'
                                  : 'bg-white/40 border-white/60 hover:bg-white/55'}
                              `}
                              onClick={() => handleCrossOff(key)}
                            >
                              {/* Animated checkbox */}
                              <motion.div
                                variants={checkboxPopVariants}
                                animate={isCrossed ? 'checked' : 'rest'}
                                className={`
                                  flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                                  ${isCrossed ? 'bg-emerald-500 border-emerald-400' : 'border-slate-300 bg-white/40'}
                                `}
                              >
                                {isCrossed && <Check size={11} className="text-white" strokeWidth={3} />}
                              </motion.div>

                              {/* Text */}
                              <span className={`flex-1 text-xs font-semibold transition-all duration-200 ${isCrossed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {item.name}
                              </span>
                              <span className={`text-[10px] font-bold flex-shrink-0 ${isCrossed ? 'text-slate-300' : 'text-slate-400'}`}>
                                {item.amountG}g
                              </span>
                            </motion.label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-5 border-t border-white/30 space-y-3">
                <button
                  onClick={handleSaveList}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-2xl shadow-card active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Save to Grocery History
                </button>
                <button
                  onClick={handleClearList}
                  className="w-full py-2.5 rounded-2xl bg-[rgba(255,168,150,0.2)] border border-[rgba(255,140,120,0.4)] text-[#9E3D25] font-bold text-sm hover:bg-[rgba(255,168,150,0.35)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Clear List
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Create Recipe Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              key="create-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9992] bg-black/20 backdrop-blur-[6px]"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              key="create-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
              className="fixed inset-0 z-[9993] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="
                  pointer-events-auto w-full max-w-lg
                  rounded-3xl border border-[rgba(255,255,255,0.6)]
                  backdrop-blur-[22px] saturate-150
                  bg-[rgba(255,255,255,0.3)]
                  shadow-[0_30px_70px_-12px_rgba(181,106,69,0.22),0_12px_32px_-8px_rgba(0,0,0,0.08)]
                  p-8 space-y-5 max-h-[90vh] overflow-y-auto
                "
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-800">Create Custom Recipe</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Add a recipe to your collection</p>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/40 rounded-xl transition text-slate-500">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateRecipe} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Recipe Name *</label>
                    <input type="text" value={recipeName} onChange={e => setRecipeName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 font-medium"
                      placeholder="e.g. Garlic Chicken Pasta" required />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
                    <input type="text" value={recipeDesc} onChange={e => setRecipeDesc(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 font-medium"
                      placeholder="Brief description of the meal" />
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Calories (kcal)', recipeCal, setRecipeCal],
                      ['Protein (g)',     recipeProtein, setRecipeProtein],
                      ['Carbs (g)',       recipeCarbs, setRecipeCarbs],
                      ['Fat (g)',         recipeFat, setRecipeFat],
                    ].map(([label, val, setter]) => (
                      <div key={label as string}>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label as string}</label>
                        <input type="number" value={val as number}
                          onChange={e => (setter as (v: number) => void)(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 font-medium" />
                      </div>
                    ))}
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Ingredients <span className="normal-case text-slate-400 font-normal">(format: Name:Qty, Name:Qty,...)</span>
                    </label>
                    <input type="text" value={stagedIngredients} onChange={e => setStagedIngredients(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 font-medium"
                      placeholder="Chicken:150, Brown Rice:100, Garlic:5" />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Instructions / Steps</label>
                    <textarea value={recipeInst} onChange={e => setRecipeInst(e.target.value)} rows={3}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 font-medium resize-none"
                      placeholder="1. Boil pasta. 2. Grill chicken..." />
                  </div>

                  <button type="submit"
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-card active:scale-95 transition-all duration-200">
                    Save Recipe to Collection
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recipes;
