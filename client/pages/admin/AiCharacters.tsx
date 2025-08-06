import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useToast } from "@/hooks/use-toast";
import { api } from "../../src/utils/api";
import { Edit, Trash2, Plus, Search, Filter, Eye, EyeOff, Save, X } from "lucide-react";

interface Character {
  _id: string;
  id: string;
  name: string;
  personality: string;
  traits: string[];
  description: string;
  avatar: string;
  systemPrompt: string;
  category: string;
  isActive: boolean;
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AiCharacters() {
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    personality: "",
    traits: "",
    description: "",
    avatar: "",
    systemPrompt: "",
    category: "General",
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/characters');
      setCharacters(response.data.characters || []);
    } catch (error) {
      console.error("Error fetching characters:", error);
      toast({
        title: "Error",
        description: "Failed to load characters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const traitsArray = formData.traits
        .split(",")
        .map((trait) => trait.trim())
        .filter((trait) => trait.length > 0);

      await api.post("/admin/characters", {
        ...formData,
        traits: traitsArray,
      });

      toast({
        title: "Success",
        description: "Character created successfully",
      });

      setShowCreateModal(false);
      resetForm();
      fetchCharacters();
    } catch (error) {
      console.error("Error creating character:", error);
      toast({
        title: "Error",
        description: "Failed to create character",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharacter) return;

    try {
      setLoading(true);
      const traitsArray = formData.traits
        .split(",")
        .map((trait) => trait.trim())
        .filter((trait) => trait.length > 0);

      await api.put(`/admin/characters/${editingCharacter._id}`, {
        ...formData,
        traits: traitsArray,
      });

      toast({
        title: "Success",
        description: "Character updated successfully",
      });

      setShowEditModal(false);
      setEditingCharacter(null);
      resetForm();
      fetchCharacters();
    } catch (error) {
      console.error("Error updating character:", error);
      toast({
        title: "Error",
        description: "Failed to update character",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string, characterName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${characterName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/admin/characters/${characterId}`);

      toast({
        title: "Success",
        description: "Character deleted successfully",
      });

      fetchCharacters();
    } catch (error) {
      console.error("Error deleting character:", error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      personality: character.personality,
      traits: character.traits.join(", "),
      description: character.description,
      avatar: character.avatar,
      systemPrompt: character.systemPrompt || "",
      category: character.category,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      personality: "",
      traits: "",
      description: "",
      avatar: "",
      systemPrompt: "",
      category: "General",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <div className="flex-1 ml-[260px]">
        <div className="p-4">
          <div className="h-[66px] border-b border-[#E5E8F1] mb-6">
            <div className="h-[62px] px-0 py-3 rounded-md shadow-md flex items-center justify-between">
              <h1 className="text-[#23272E] text-2xl font-bold">AI Characters</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#036BF2] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0256d1] transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Create Character
              </button>
            </div>
          </div>

          {/* Characters List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#036BF2] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading characters...</p>
            </div>
          ) : characters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No characters found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <div
                  key={character._id}
                  className={`bg-white rounded-lg border border-[#E5E8F1] p-6 transition-all hover:shadow-md ${
                    !character.isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48?text=AI";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-[#23272E]">{character.name}</h3>
                        <span className="text-sm text-gray-500">{character.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(character)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit character"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(character._id, character.name)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete character"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Personality</p>
                      <p className="text-sm text-[#23272E]">{character.personality}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-sm text-[#23272E] line-clamp-2">
                        {character.description}
                      </p>
                    </div>

                    {character.traits && character.traits.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Traits</p>
                        <div className="flex flex-wrap gap-1">
                          {character.traits.map((trait, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Created by {character.createdBy?.name || 'Unknown'} on{" "}
                        {new Date(character.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Character Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Character</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCharacter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Funny">Funny</option>
                    <option value="Supportive">Supportive</option>
                    <option value="Flirty">Flirty</option>
                    <option value="Professional">Professional</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personality *
                </label>
                <input
                  type="text"
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shy, Sarcastic, Friendly"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traits (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.traits}
                  onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Intelligent, Witty, Caring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL *
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/avatar.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the character"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt *
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instructions for AI behavior and personality"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Creating..." : "Create Character"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Character Modal */}
      {showEditModal && editingCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Character: {editingCharacter.name}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCharacter(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditCharacter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Funny">Funny</option>
                    <option value="Supportive">Supportive</option>
                    <option value="Flirty">Flirty</option>
                    <option value="Professional">Professional</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personality *
                </label>
                <input
                  type="text"
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shy, Sarcastic, Friendly"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traits (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.traits}
                  onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Intelligent, Witty, Caring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL *
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/avatar.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the character"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt *
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instructions for AI behavior and personality"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCharacter(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Updating..." : "Update Character"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 