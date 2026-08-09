import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AddPGModal } from '../components/AddPGModal';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { NotificationCenter } from '../components/NotificationCenter';
import { Building2, Plus, Users, DollarSign, Star, CheckCircle2, Phone, Trash2, Download, AlertTriangle, MessageSquare } from 'lucide-react';

export const OwnerDashboard = ({ onSelectPG }) => {
  const { user } = useAuth();
  const [myPGs, setMyPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchOwnerPGs = async () => {
      try {
        const res = await fetch('/api/pgs');
        const data = await res.json();
        if (data.success) {
          setMyPGs(data.data);
        }
      } catch (err) {
        console.error('Fetch owner PGs error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerPGs();
  }, []);

  const handleCreatedPG = (newPG) => {
    setMyPGs([newPG, ...myPGs]);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Owner Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Building2 className="w-4 h-4 text-purple-400" /> PG Owner Management Hub
          </div>
          <h1 className="text-3xl font-extrabold font-sans">
            Property Dashboard ({user?.name || 'Landlord'})
          </h1>
          <p className="text-xs text-indigo-200">
            Directly connect with university students without paying third-party broker fees.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New PG Listing
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{myPGs.length}</div>
            <div className="text-xs text-slate-500 font-medium">Listed Properties</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">18 Beds</div>
            <div className="text-xs text-slate-500 font-medium">Total Student Capacity</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">42 Student Leads</div>
            <div className="text-xs text-slate-500 font-medium">Inquiries Last 30 Days</div>
          </div>
        </div>
      </div>

      {/* Property List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Active PG Accommodations ({myPGs.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myPGs.map((pg) => (
              <div
                key={pg._id || pg.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
                    alt={pg.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{pg.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {pg.status || 'Approved'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{pg.location} • {pg.gender}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">₹{pg.pricePerMonth?.toLocaleString()}/mo</span>
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {pg.rating || 4.8} ({pg.reviewsCount || 10} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onSelectPG(pg)}
                    className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-900"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Owner Analytics & Complaints Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Occupancy & Room Capacity Distribution"
          subtitle="Percentage of filled beds per accommodation type"
          items={[
            { category: 'Single Private Rooms', count: 6, percentage: 100, color: '#10b981' },
            { category: '2-Sharing Deluxe Rooms', count: 10, percentage: 83, color: '#6366f1' },
            { category: '3-Sharing Budget Beds', count: 2, percentage: 66, color: '#f59e0b' }
          ]}
        />

        <AnalyticsChart
          title="Student Complaints & Maintenance Status"
          subtitle="Resolution performance for logged student tickets"
          items={[
            { category: 'Resolved Plumbing & AC', count: 12, percentage: 80, color: '#10b981' },
            { category: 'In-Progress Wi-Fi Upgrades', count: 2, percentage: 13, color: '#6366f1' },
            { category: 'Open Maintenance Requests', count: 1, percentage: 7, color: '#ef4444' }
          ]}
        />
      </div>

      {showAddModal && (
        <AddPGModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleCreatedPG}
        />
      )}

    </div>
  );
};
