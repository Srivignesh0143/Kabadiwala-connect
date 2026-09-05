import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'COLLECTOR',
  location: 'Bengaluru',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(defaultForm);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await register(form);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to register');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Join the network</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Create account</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-700">Full name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" required />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-700">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
              <option value="COLLECTOR">Collector</option>
              <option value="AGGREGATOR">Aggregator</option>
              <option value="RECYCLER">Recycler</option>
            </select>
          </div>

          <button type="submit" className="md:col-span-2 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
