import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  materialType: 'PCB',
  estimatedWeight: '',
  location: 'Bengaluru',
  image: '',
  description: '',
};
export default function LotFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.onerror = () => {
      toast.error('Unable to read the selected image');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.image) {
      toast.error('Please upload a material image');
      return;
    }

    setSubmitting(true);

    try {
  const lotData = {
    ...form,
    lotId: `LOT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  };

  await api.post('/lots', lotData);

  toast.success('Lot created and saved successfully');
  navigate('/lots');
}catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to create lot'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">
          {user?.role === 'AGGREGATOR'
            ? 'Aggregator workflow'
            : 'Collector workflow'}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Create e-waste lot
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 md:grid-cols-2"
      >
        {/* Material Type */}

        <div>
          <label className="mb-1 block text-sm text-slate-700">
            Material type
          </label>

          <select
            name="materialType"
            value={form.materialType}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900"
          >
            <option value="PCB">PCB</option>
            <option value="Copper">Copper</option>
            <option value="Aluminium">Aluminium</option>
            <option value="Steel">Steel</option>
            <option value="Cable">Cable</option>
            <option value="Battery">Battery</option>
            <option value="Mixed E-Waste">Mixed E-Waste</option>
            <option value="Plastic">Plastic</option>
            <option value="Glass">Glass</option>
            <option value="Paper">Paper</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Estimated Weight */}

        <div>
          <label className="mb-1 block text-sm text-slate-700">
            Estimated weight (kg)
          </label>

          <input
            type="number"
            name="estimatedWeight"
            value={form.estimatedWeight}
            onChange={handleChange}
            min="1"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900"
            required
          />
        </div>

        {/* Location */}

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">
            Location
          </label>

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900"
            required
          />
        </div>

        {/* Image */}

        <div>
          <label className="mb-1 block text-sm text-slate-700">
            Material image
          </label>

          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-emerald-700"
            required
          />

          {form.image ? (
            <img
              src={form.image}
              alt="Selected material preview"
              className="mt-3 h-24 w-24 rounded-xl object-cover"
            />
          ) : null}
        </div>

        {/* Description */}

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900"
          />
        </div>

        {/* Submit */}

        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Create lot'}
        </button>
      </form>
    </div>
  );
}