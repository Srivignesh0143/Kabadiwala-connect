import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../lib/api';

const initialForm = {
  materialType: 'PCB',
  estimatedWeight: '',
  location: 'Bengaluru',
  image: '',
  description: '',
};

export default function LotFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/lots', form);
      toast.success('Lot created and saved successfully');
      navigate('/lots');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create lot');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Collector workflow</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Create e-waste lot</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Material type</label>
          <select name="materialType" value={form.materialType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
            <option value="PCB">PCB</option>
            <option value="Copper">Copper</option>
            <option value="Aluminium">Aluminium</option>
            <option value="Cable">Cable</option>
            <option value="Battery">Battery</option>
            <option value="Mixed E-Waste">Mixed E-Waste</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Estimated weight (kg)</label>
          <input type="number" name="estimatedWeight" value={form.estimatedWeight} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" required />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" required />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">Material image URL</label>
          <input name="image" value={form.image} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" placeholder="https://..." />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
        </div>

        <button type="submit" disabled={submitting} className="md:col-span-2 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Saving...' : 'Create lot'}
        </button>
      </form>
    </div>
  );
}
