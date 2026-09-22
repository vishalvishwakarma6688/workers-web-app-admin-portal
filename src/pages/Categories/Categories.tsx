import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import type { ServiceCategoryAdminDTO } from '../../api/admin.api';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Grid,
  Search,
  RefreshCw,
  Zap,
  Droplet,
  Hammer,
  Paintbrush,
  Wind,
  Wrench,
  Shield,
  Cpu,
  Tv,
  Flame,
  Truck,
  Scissors,
} from 'lucide-react';
import './Categories.css';

const AVAILABLE_LUCIDE_ICONS = [
  { key: 'Zap', label: 'Electrical', icon: Zap },
  { key: 'Droplet', label: 'Plumbing', icon: Droplet },
  { key: 'Hammer', label: 'Carpentry', icon: Hammer },
  { key: 'Paintbrush', label: 'Painting', icon: Paintbrush },
  { key: 'Wind', label: 'AC / Cooling', icon: Wind },
  { key: 'Wrench', label: 'Appliance Repair', icon: Wrench },
  { key: 'Shield', label: 'Security & CCTV', icon: Shield },
  { key: 'Cpu', label: 'Electronics', icon: Cpu },
  { key: 'Tv', label: 'TV & Home Theatre', icon: Tv },
  { key: 'Flame', label: 'Heating / Gas', icon: Flame },
  { key: 'Truck', label: 'Movers & Packers', icon: Truck },
  { key: 'Scissors', label: 'Salon / Beauty', icon: Scissors },
  { key: 'Grid', label: 'General / Other', icon: Grid },
];

export const getCategoryLucideIcon = (cat: { slug?: string; name?: string; iconUrl?: string }) => {
  const iconKey = cat.iconUrl || '';
  const slug = (cat.slug || cat.name || '').toLowerCase();

  // 1. Direct match by iconKey
  const matchedByKey = AVAILABLE_LUCIDE_ICONS.find((item) => item.key.toLowerCase() === iconKey.toLowerCase());
  if (matchedByKey) return matchedByKey.icon;

  // 2. Fallback match by domain name/slug
  if (slug.includes('electric')) return Zap;
  if (slug.includes('plumb')) return Droplet;
  if (slug.includes('carpent')) return Hammer;
  if (slug.includes('paint')) return Paintbrush;
  if (slug.includes('ac') || slug.includes('air-condition') || slug.includes('cooling')) return Wind;
  if (slug.includes('appliance') || slug.includes('repair')) return Wrench;
  if (slug.includes('security') || slug.includes('cctv') || slug.includes('lock')) return Shield;
  if (slug.includes('electronic') || slug.includes('computer')) return Cpu;
  if (slug.includes('tv')) return Tv;
  if (slug.includes('gas') || slug.includes('heat')) return Flame;
  if (slug.includes('mover') || slug.includes('shift')) return Truck;

  return Grid;
};

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategoryAdminDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryAdminDTO | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: 'Zap',
    sortOrder: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getCategories(true);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service domains');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      iconUrl: 'Zap',
      sortOrder: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: ServiceCategoryAdminDTO) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      iconUrl: cat.iconUrl || 'Grid',
      sortOrder: cat.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save service domain');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategoryStatus = async (cat: ServiceCategoryAdminDTO) => {
    try {
      await adminApi.updateCategory(cat.id, { isActive: !cat.isActive });
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to update domain status');
    }
  };

  const handleDelete = async (cat: ServiceCategoryAdminDTO) => {
    if (!window.confirm(`Are you sure you want to delete "${cat.name}" domain?`)) return;

    try {
      await adminApi.deleteCategory(cat.id);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete domain');
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Domains & Categories</h1>
          <p className="page-subtitle">
            Manage technician domains available across the mobile application in real time
          </p>
        </div>
        <button className="add-domain-btn" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Add New Domain</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="categories-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search service domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="refresh-btn" onClick={fetchCategories} title="Refresh Domains">
          <RefreshCw size={16} />
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading service domains...</p>
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map((cat) => {
            const IconComponent = getCategoryLucideIcon(cat);
            return (
              <div key={cat.id} className={`category-card ${!cat.isActive ? 'inactive' : ''}`}>
                <div className="card-header">
                  <div className="category-icon-wrapper">
                    <IconComponent size={24} className="category-icon-lucide" />
                  </div>
                  <div className="card-title-group">
                    <h3>{cat.name}</h3>
                    <span className="slug-tag">/{cat.slug}</span>
                  </div>
                  <button
                    className={`status-chip ${cat.isActive ? 'active' : 'disabled'}`}
                    onClick={() => toggleCategoryStatus(cat)}
                    title="Click to toggle active status"
                  >
                    {cat.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    <span>{cat.isActive ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>

                <p className="category-description">
                  {cat.description || 'No description provided for this service domain.'}
                </p>

                <div className="card-footer">
                  <span className="sort-order">Sort Order: {cat.sortOrder}</span>
                  <div className="card-actions">
                    <button className="action-btn edit" onClick={() => openEditModal(cat)} title="Edit Domain">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(cat)} title="Delete Domain">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="no-domains">
              <Grid size={48} />
              <p>No service domains found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Domain Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Service Domain' : 'Add New Service Domain'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="domain-form">
              <div className="form-group">
                <label>Domain Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrician, Plumber, Carpenter, Security"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of services provided under this domain..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Select Domain Icon (Lucide Vector)</label>
                <div className="icon-selector-grid">
                  {AVAILABLE_LUCIDE_ICONS.map((item) => {
                    const IconEl = item.icon;
                    const isSelected = formData.iconUrl === item.key;
                    return (
                      <button
                        type="button"
                        key={item.key}
                        className={`icon-option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, iconUrl: item.key })}
                      >
                        <IconEl size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Display Sort Order</label>
                <input
                  type="number"
                  min={1}
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Domain' : 'Create Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
