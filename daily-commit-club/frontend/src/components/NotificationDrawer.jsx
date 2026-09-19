import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Flame, AlertTriangle, CheckCircle, Coffee, Shield } from 'lucide-react';
import { fetchApi } from '../services/api';

/**
 * Notification Drawer Component
 * Displays real notification audit history fetched from the backend.
 */
export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadNotifications = async () => {
        try {
          setLoading(true);
          const res = await fetchApi('/challenge/status');
          if (res?.data?.members) {
            // Map member activities into notification log items
            const logs = res.data.members.map((m) => {
              const u = m.user || {};
              if (m.todayStatus === 'completed') {
                return {
                  id: u.id,
                  type: 'SUCCESS',
                  title: 'Day Survived',
                  message: `@${u.githubUsername} completed today's challenge! (Streak: ${u.currentStreak}d)`,
                  icon: <CheckCircle className="w-4 h-4 text-emerald-400" />
                };
              } else if (m.todayStatus === 'missed') {
                return {
                  id: u.id,
                  type: 'MISSED_COMMIT',
                  title: 'Building Damaged',
                  message: `@${u.githubUsername} missed their commit. Coffee penalty +1!`,
                  icon: <AlertTriangle className="w-4 h-4 text-rose-400" />
                };
              } else {
                return {
                  id: u.id,
                  type: 'MORNING_REMINDER',
                  title: 'Commit Pending',
                  message: `@${u.githubUsername} has a pending commit for today.`,
                  icon: <Bell className="w-4 h-4 text-amber-400" />
                };
              }
            });
            setNotifications(logs);
          }
        } catch (err) {
          console.warn('Failed to load notifications:', err);
        } finally {
          setLoading(false);
        }
      };
      loadNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed top-20 right-6 z-50 w-80 ornate-border rounded-2xl p-5 bg-slate-900/95 border border-amber-500/40 shadow-2xl text-slate-100 select-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Bell className="w-4 h-4 text-amber-400" /> Realm Notifications
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-6 text-xs text-slate-500 italic">Scanning realm logs...</div>
          ) : notifications.length > 0 ? (
            notifications.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs flex gap-3 items-start">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="font-bold text-amber-200">{item.title}</div>
                  <div className="text-[11px] text-slate-300 leading-snug mt-0.5">{item.message}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 italic">No recent realm alerts logged.</div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
