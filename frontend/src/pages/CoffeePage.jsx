import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Coffee, AlertCircle, CheckCircle, ExternalLink, RefreshCw, Trophy, Flame } from 'lucide-react';

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
    <div className="min-h-screen bg-[#05140e] text-emerald-50 font-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Coffee Accountability</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-50 tracking-tight">
              Coffee Debt Roster
            </h1>
            <p className="text-sm text-emerald-300/70 mt-1">
              Missed commits have consequences. Here are the club members who owe coffee. ☕
            </p>
          </div>

          <button
            onClick={fetchCoffeeDebts}
            disabled={loading}
            className="club-button-secondary py-2.5 px-4 text-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="club-card p-6 border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-emerald-950/60">
            <div className="flex items-center justify-between text-amber-400/80 mb-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Total Group Debt</span>
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {totalCoffees} <span className="text-base font-normal text-amber-300/70">coffees</span>
            </div>
            <p className="text-xs text-emerald-400/60 mt-1">Total coffees owed across all members</p>
          </div>

          <div className="club-card p-6">
            <div className="flex items-center justify-between text-emerald-400/70 mb-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Debtors Count</span>
              <AlertCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-100 font-mono">
              {debtorCount} <span className="text-base font-normal text-emerald-400/70">members</span>
            </div>
            <p className="text-xs text-emerald-400/60 mt-1">Members with active coffee debt</p>
          </div>

          <div className="club-card p-6 border-emerald-500/30">
            <div className="flex items-center justify-between text-emerald-400/70 mb-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Your Debt</span>
              <Coffee className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {userDebt} <span className="text-base font-normal text-amber-300/70">coffees</span>
            </div>
            <p className="text-xs text-emerald-400/60 mt-1">
              {userDebt === 0 ? "You're clean! Keep committing 🎉" : "You owe coffee to the club!"}
            </p>
          </div>

        </div>

        {/* DEBTORS LIST */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-emerald-100 flex items-center gap-2 border-b border-emerald-900/40 pb-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            Current Debtors ({debtorCount})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="club-card p-5 animate-pulse h-20 bg-emerald-950/40"></div>
              ))}
            </div>
          ) : error ? (
            <div className="club-card p-8 text-center text-red-300 bg-red-950/30">
              <p>{error}</p>
            </div>
          ) : debtors.length === 0 ? (
            <div className="club-card p-12 text-center space-y-3 border-emerald-500/30 bg-emerald-950/40">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-100">No Coffee Debtors!</h3>
              <p className="text-xs text-emerald-300/70 max-w-sm mx-auto">
                Everyone in the club is currently clean. All members have kept up with their daily commitments!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {debtors.map(debtor => (
                <div 
                  key={debtor.id}
                  className="club-card p-5 flex items-center justify-between gap-4 border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-emerald-950/40 to-emerald-950/40"
                >
                  <div className="flex items-center gap-4">
                    {debtor.github_avatar_url ? (
                      <img 
                        src={debtor.github_avatar_url} 
                        alt={debtor.name} 
                        className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full object-cover border-2 border-amber-500/40 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-amber-900/60 border border-amber-700 flex items-center justify-center font-bold text-amber-100 text-base">
                        {debtor.name?.[0] || 'D'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-emerald-50 flex items-center gap-2">
                        {debtor.name}
                        {debtor.id === profile?.id && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 font-mono">You</span>
                        )}
                      </h3>
                      <a 
                        href={debtor.github_url || `https://github.com/${debtor.github_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-emerald-400/70 hover:text-emerald-200 inline-flex items-center gap-1"
                      >
                        @{debtor.github_username}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right font-mono">
                      <span className="text-xl font-extrabold text-amber-400 block">
                        ☕ {debtor.coffee_debt}
                      </span>
                      <span className="text-[10px] text-emerald-500/70 uppercase">
                        {debtor.coffee_debt === 1 ? '1 Coffee Owed' : `${debtor.coffee_debt} Coffees Owed`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RULE CALLOUT */}
        <div className="p-5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-xs text-emerald-300/70 space-y-1 font-mono">
          <div className="font-bold text-emerald-200 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            Daily Commit Club Rule #1
          </div>
          <p>
            Each missed day at 8:00 PM IST increments your coffee debt by exactly 1 coffee. Debts persist until settled with club members!
          </p>
        </div>

      </div>
    </div>
  );
}
