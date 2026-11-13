import React, { useEffect, useState, useCallback } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  FolderPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { getCategoryIcon } from "../utils/categoryIcons";

export default function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        setName("");
        setMessage("Category created successfully!");
        loadCategories();
      } else {
        const error = await response.json();
        setMessage(typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category? This will also remove its associated budgets and expenses.")) {
      return;
    }
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`http://localhost:8000/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage("Category deleted.");
        loadCategories();
      } else {
        const error = await response.json();
        setMessage(typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    }
  }

  async function handleSave(id) {
    if (!editName.trim()) return;
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`http://localhost:8000/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setMessage("Category renamed.");
        loadCategories();
      } else {
        const error = await response.json();
        setMessage(typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    }
  }


  return (
    <AppLayout onDataRefresh={loadCategories}>
      <div className="space-y-6">

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center justify-between ${isError
                ? "bg-rose-50 border border-rose-200 text-rose-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
              }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage("")} className="p-1 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CATEGORIES MANAGER */}
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl mono-gradient-primary text-white flex items-center justify-center">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Your Categories</h4>
                    <p className="text-[11px] text-slate-400">
                      {categories.length} categories
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAdd} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Healthcare, Freelance, Subscriptions..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl mono-gradient-primary text-white font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* Category Items List */}
              <div className="divide-y divide-slate-100 pt-2">
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No categories created yet. Add one above!
                  </p>
                ) : (
                  categories.map((category) => {
                    const { icon: CatIcon, bg } = getCategoryIcon(category.name);
                    const isEditing = editingId === category.id;

                    return (
                      <div
                        key={category.id}
                        className="py-3 flex items-center justify-between hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full py-1.5 px-3 bg-white border border-[#438883] rounded-lg text-sm focus:outline-none ring-2 ring-[#438883]/20"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSave(category.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                              >
                                <CatIcon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-slate-800 truncate">
                                {category.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingId(category.id);
                                  setEditName(category.name);
                                }}
                                title="Edit"
                                className="p-2 text-slate-400 hover:text-[#2F7E79] hover:bg-[#EEF8F7] rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                title="Delete"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
