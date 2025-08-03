import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Edit, Trash2, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { api } from "../../src/utils/api";

interface CategoryItem {
  _id: string;
  name: string;
  value: string;
  description?: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  type: 'image' | 'video' | 'character';
  description?: string;
  items: CategoryItem[];
  isActive: boolean;
}

export default function Videos() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  
  const [itemForm, setItemForm] = useState({
    name: '',
    value: '',
    description: ''
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?type=video');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', {
        ...categoryForm,
        type: 'video'
      });
      setShowCreateCategory(false);
      setCategoryForm({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    try {
      await api.post(`/admin/categories/${selectedCategory._id}/items`, itemForm);
      setShowCreateItem(false);
      setItemForm({ name: '', value: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !editingItem) return;
    
    try {
      await api.put(`/admin/categories/${selectedCategory._id}/items/${editingItem._id}`, itemForm);
      setEditingItem(null);
      setItemForm({ name: '', value: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedCategory || !window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/admin/categories/${selectedCategory._id}/items/${itemId}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openItemModal = (category: Category, item?: CategoryItem) => {
    setSelectedCategory(category);
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        value: item.value,
        description: item.description || ''
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        value: '',
        description: ''
      });
    }
    setShowCreateItem(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <div className="flex-1 ml-[260px]">
        <div className="p-4">
          <div className="h-[66px] border-b border-[#E5E8F1] mb-6">
            <div className="h-[62px] px-0 py-3 rounded-md shadow-md flex items-center justify-between">
              <h1 className="text-[#23272E] text-2xl font-bold">Videos - Categories & Items</h1>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateCategory(true)}
                  className="bg-[#036BF2] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0256d1] transition-colors"
                >
                  New category
                </button>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg border border-[#E5E8F1] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#23272E]">{category.name}</h2>
                  <button
                    onClick={() => openItemModal(category)}
                    className="bg-[#036BF2] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-[#0256d1] flex items-center gap-1"
                  >
                    <Plus size={16} /> New item
                  </button>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-2 bg-[rgba(226,235,250,0.56)] rounded-lg border border-[#E5E8F1] px-3 py-2"
                    >
                      <span className="bg-white px-2 py-1 rounded-full text-[#23272E] font-['Public_Sans'] text-sm font-medium border border-[#E5E8F1]">
                        {item.name}
                      </span>
                      <span className="text-[#23272E] font-['Public_Sans'] text-sm">
                        {item.value}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openItemModal(category, item)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white border border-[#E5E8F1] hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-3 h-3 text-[#666]" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[rgba(255,26,0,0.16)] hover:bg-[rgba(255,26,0,0.24)] transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCategory(false);
                    setCategoryForm({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Item Modal */}
      {showCreateItem && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">Category: {selectedCategory.name}</p>
            <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="text"
                    value={itemForm.value}
                    onChange={(e) => setItemForm({...itemForm, value: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateItem(false);
                    setEditingItem(null);
                    setSelectedCategory(null);
                    setItemForm({ name: '', value: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
