import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Coffee, AlertCircle, CheckCircle, ExternalLink, RefreshCw, Github } from 'lucide-react';

export default function CoffeePage() {
  const { profile } = useAuth();
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoffeeDebts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .not('github_username', 'is', null)
        .gt('coffee_debt', 0)
        .order('coffee_debt', { ascending: false });

      if (fetchErr) throw fetchErr;

      setDebtors(data || []);
    } catch (err) {
      console.error('Error fetching coffee debts:', err);
      setError('Failed to load coffee debt roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoffeeDebts();
  }, []);

  const totalCoffees = debtors.reduce((sum, d) => sum + (d.coffee_debt || 0), 0);
  const debtorCount = debtors.length;
  const userDebt = profile?.coffee_debt || 0;

  return (
    <div className="page-container space-y-6">
        
      {/* 1. Header */}
      <section className="dashboard-header">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>Coffee Accountability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Coffee Debt Roster
          </h1>
          <p className="text-xs sm:text-sm text-emerald-400/80 mt-1 font-mono">
            Missed daily commits incur club coffee debt. Keep committing to stay clear! ☕
          </p>
        </div>

        <button
          onClick={fetchCoffeeDebts}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Roster</span>
        </button>
      </section>

      {/* 2. Summary Cards (3 Equal Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300/80">Group Coffee Debt</span>
            <Coffee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
              {totalCoffees} <span className="text-base font-normal text-amber-400/80">coffees</span>
            </div>
            <div className="text-xs text-emerald-400/70 mt-1 font-mono">
              Total owed across all members
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300/80">Active Debtors</span>
            <AlertCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {debtorCount} <span className="text-base font-normal text-emerald-400/80">members</span>
            </div>
            <div className="text-xs text-emerald-400/70 mt-1 font-mono">
              Members with outstanding debt
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300/80">Your Coffee Debt</span>
            <Coffee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
              {userDebt} <span className="text-base font-normal text-amber-400/80">coffees</span>
            </div>
            <div className="text-xs text-emerald-400/70 mt-1 font-mono">
              {userDebt === 0 ? "You're clean! Keep committing 🎉" : "Owed to club members"}
            </div>
          </div>
        </div>

      </section>

      {/* 3. Debtors List / Polished Empty State */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Coffee className="w-4 h-4 text-amber-400" />
          <span>Members Who Owe Coffee ({debtorCount})</span>
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="card p-6 animate-pulse h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-red-300">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : debtors.length === 0 ? (
          <div className="card flex flex-col items-center justify-center text-center py-12 px-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-2xl mb-1">
              ☕
            </div>
            <h3 className="text-xl font-bold text-white">No Coffee Debt</h3>
            <p className="text-sm text-emerald-300/70 max-w-md">
              Everyone is clear today. All active members have maintained their daily commitment!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {debtors.map(debtor => (
              <div key={debtor.id} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {debtor.github_avatar_url ? (
                    <img 
                      src={debtor.github_avatar_url} 
                      alt={debtor.name} 
                      className="w-12 h-12 rounded-full object-cover border border-[#143527]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-white">
                      {debtor.name?.[0] || 'M'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-white truncate">{debtor.name}</h4>
                    <p className="text-xs font-mono text-emerald-400/70 truncate">@{debtor.github_username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-2xl font-bold text-amber-400">{debtor.coffee_debt}</span>
                    <span className="text-xs text-amber-400/80 ml-1">coffees</span>
                  </div>

                  <a
                    href={debtor.github_url || `https://github.com/${debtor.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-emerald-400 hover:text-white rounded-lg border border-[#143527] hover:border-emerald-500/40 transition-colors"
                    title="View GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
