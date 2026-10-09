import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Coffee, AlertCircle, RefreshCw, ArrowUpRight } from 'lucide-react';

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
    <div className="page-container space-y-8 font-pixel">
        
      {/* 1. Header */}
      <section className="dashboard-header border-b border-emerald-900/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="pixel-badge">
              <span className="pixel-dot"></span>
              <span>COFFEE LEDGER</span>
            </span>
            <span className="text-xs text-emerald-600">•</span>
            <span className="text-xs text-emerald-300 font-medium">8:00 PM IST RULE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#ecfdf5] tracking-tight font-display-clean">
            Coffee Debt Roster ☕
          </h1>
          <p className="text-sm text-emerald-200/80 leading-relaxed font-sans-clean">
            Miss a daily commit before 8:00 PM IST, owe coffee to the club
          </p>
        </div>

        <button
          onClick={fetchCoffeeDebts}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00ff88]' : ''}`} />
          <span>REFRESH ROSTER</span>
        </button>
      </section>

      {/* 2. Summary Cards (3 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Card 1: Total Group Debt */}
        <div className="card flex flex-col justify-between group hover:border-[#fbbf24] transition-all">
          <div className="flex items-center justify-between text-[#86efac] mb-2">
            <span className="text-[10px] font-arcade uppercase tracking-wider">GROUP COFFEE DEBT</span>
            <Coffee className="w-4 h-4 text-[#fbbf24]" />
          </div>
          <div className="my-2">
            <div className="text-4xl sm:text-5xl font-bold text-[#fbbf24] tracking-tight flex items-baseline gap-2">
              {totalCoffees} <span className="text-sm font-arcade text-[#fbbf24]/70">CUPS</span>
            </div>
            <div className="text-xs text-[#86efac] mt-1 font-silkscreen">
              Total cups owed across all members
            </div>
          </div>
        </div>

        {/* Card 2: Active Debtors */}
        <div className="card flex flex-col justify-between group hover:border-[#34d399] transition-all">
          <div className="flex items-center justify-between text-[#86efac] mb-2">
            <span className="text-[10px] font-arcade uppercase tracking-wider">ACTIVE DEBTORS</span>
            <AlertCircle className="w-4 h-4 text-[#34d399]" />
          </div>
          <div className="my-2">
            <div className="text-4xl sm:text-5xl font-bold text-[#ecfdf5] tracking-tight flex items-baseline gap-2">
              {debtorCount} <span className="text-sm font-arcade text-[#86efac]">PLAYERS</span>
            </div>
            <div className="text-xs text-[#86efac] mt-1 font-silkscreen">
              Members with outstanding tabs
            </div>
          </div>
        </div>

        {/* Card 3: User's Tab */}
        <div className="card flex flex-col justify-between group hover:border-[#00ff88] transition-all">
          <div className="flex items-center justify-between text-[#86efac] mb-2">
            <span className="text-[10px] font-arcade uppercase tracking-wider">YOUR TAB</span>
            <Coffee className="w-4 h-4 text-[#fbbf24]" />
          </div>
          <div className="my-2">
            <div className="text-4xl sm:text-5xl font-bold text-[#ecfdf5] tracking-tight flex items-baseline gap-2">
              <span className={userDebt > 0 ? 'text-[#fbbf24]' : 'text-[#00ff88]'}>{userDebt}</span>
              <span className="text-sm font-arcade text-[#86efac]">CUPS</span>
            </div>
            <div className="text-xs text-[#86efac] mt-1 font-silkscreen">
              {userDebt === 0 ? "You're 100% clean! Keep committing 🎉" : "Owed to club members"}
            </div>
          </div>
        </div>

      </section>

      {/* 3. Debtors List / Retro Pixel Empty State */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-[#ecfdf5] uppercase font-arcade tracking-wider flex items-center gap-2">
          <Coffee className="w-4 h-4 text-[#fbbf24]" />
          <span>Members Who Owe Coffee ({debtorCount})</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(i => (
              <div key={i} className="card p-6 animate-pulse h-24"></div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-[#fca5a5]">
            <p className="text-sm font-arcade">{error}</p>
          </div>
        ) : debtors.length === 0 ? (
          <div className="card flex flex-col items-center justify-center text-center py-16 px-6 space-y-4">
            <div className="w-16 h-16 bg-[#064e3b] border-2 border-[#00ff88] flex items-center justify-center text-2xl shadow-[4px_4px_0px_#020604]">
              ☕
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#00ff88]">ZERO COFFEE DEBTS ACTIVE!</h3>
              <p className="text-xs sm:text-sm text-[#86efac] max-w-md font-silkscreen">
                Every member has honored their daily commit deadline. The collective tab is clear!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {debtors.map(debtor => (
              <div key={debtor.id} className="card flex items-center justify-between gap-4 group hover:border-[#fbbf24] transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  {debtor.github_avatar_url ? (
                    <img 
                      src={debtor.github_avatar_url} 
                      alt={debtor.name} 
                      className="w-12 h-12 object-cover border-2 border-[#10b981] shadow-[2px_2px_0px_#020604]"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#064e3b] flex items-center justify-center font-arcade text-white border-2 border-[#10b981]">
                      {debtor.name?.[0] || 'M'}
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-base font-bold text-[#ecfdf5] truncate">{debtor.name}</h4>
                    <p className="text-xs font-mono text-[#86efac] truncate">@{debtor.github_username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right px-3 py-1 bg-[#030f0a] border-2 border-[#fbbf24] shadow-[2px_2px_0px_#020604]">
                    <span className="text-2xl font-bold text-[#fbbf24]">{debtor.coffee_debt}</span>
                    <span className="text-[10px] text-[#86efac] uppercase ml-1 font-arcade">CUPS</span>
                  </div>

                  <a
                    href={debtor.github_url || `https://github.com/${debtor.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 text-[#86efac] hover:text-[#00ff88] bg-[#030f0a] border-2 border-[#0d422c] hover:border-[#00ff88] transition-colors shadow-[2px_2px_0px_#020604]"
                    title="View GitHub"
                  >
                    <ArrowUpRight className="w-4 h-4" />
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
