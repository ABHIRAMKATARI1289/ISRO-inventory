import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [entries, setEntries] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [cats, itms, ents, iss] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/items'),
        axios.get('/api/entries'),
        axios.get('/api/issues'),
      ]);
      setCategories(cats.data);
      setItems(itms.data);
      setEntries(ents.data);
      setIssues(iss.data);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const addCategory = useCallback(async (name) => {
    const { data } = await axios.post('/api/categories', { name });
    setCategories(prev => [...prev, data]);
    return data;
  }, []);

  const addItem = useCallback(async (categoryId, name, threshold = 5) => {
    const { data } = await axios.post('/api/items', { categoryId, name, currentStock: 0, threshold });
    setItems(prev => [...prev, data]);
    return data;
  }, []);

  const updateItemThreshold = useCallback(async (itemId, threshold) => {
    const { data } = await axios.patch(`/api/items/${itemId}`, { threshold });
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, threshold: String(threshold) } : i));
    return data;
  }, []);

  const deleteItem = useCallback(async (itemId) => {
    await axios.delete(`/api/items/${itemId}`);
    setItems(prev => prev.filter(i => i.id !== itemId));
    setEntries(prev => prev.filter(e => e.itemId !== itemId));
    setIssues(prev => prev.filter(i => i.itemId !== itemId));
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    const { data } = await axios.delete(`/api/categories/${categoryId}`);
    const removedItemIds = new Set(
      items.filter(i => i.categoryId === categoryId).map(i => i.id)
    );
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    setItems(prev => prev.filter(i => i.categoryId !== categoryId));
    setEntries(prev => prev.filter(e => !removedItemIds.has(e.itemId)));
    setIssues(prev => prev.filter(i => !removedItemIds.has(i.itemId)));
    return data;
  }, [items]);

  const addEntry = useCallback(async (payload) => {
    const { data } = await axios.post('/api/entries', payload);
    await fetchAll();
    return data;
  }, [fetchAll]);

  const addIssue = useCallback(async (payload) => {
    const { data } = await axios.post('/api/issues', payload);
    await fetchAll();
    return data;
  }, [fetchAll]);

  const getItemsByCategory = useCallback((categoryId) => {
    return items.filter(i => i.categoryId === categoryId);
  }, [items]);

  const getItemById = useCallback((id) => {
    return items.find(i => i.id === id);
  }, [items]);

  const getCategoryById = useCallback((id) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  // ── Derived: low stock items ─────────────────────────────────────────────
  const lowStockItems = items
    .filter(i => Number(i.currentStock) <= Number(i.threshold || 5))
    .map(i => ({
      ...i,
      categoryName: categories.find(c => c.id === i.categoryId)?.name || '—',
      deficit: Number(i.threshold || 5) - Number(i.currentStock),
    }))
    .sort((a, b) => b.deficit - a.deficit);

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalItems      = items.length;
  const today           = new Date().toISOString().slice(0, 10);
  const entriesToday    = entries.filter(e => e.date === today).length;
  const issuesToday     = issues.filter(i => i.date === today).length;
  const totalQtyInStore = items.reduce((sum, i) => sum + (Number(i.currentStock) || 0), 0);
  const totalReceived   = entries.reduce((sum, e) => sum + (Number(e.qtyReceived) || 0), 0);
  const totalIssued     = issues.reduce((sum, i) => sum + (Number(i.qtyIssued) || 0), 0);

  return (
    <StoreContext.Provider value={{
      categories, items, entries, issues, loading, toast,
      fetchAll, showToast,
      addCategory, addItem, addEntry, addIssue, updateItemThreshold, deleteItem, deleteCategory,
      getItemsByCategory, getItemById, getCategoryById,
      lowStockItems,
      // stats
      totalItems, entriesToday, issuesToday,
      totalQtyInStore, totalReceived, totalIssued,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
