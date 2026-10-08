import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile for authenticated user
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check initial active session
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper to extract GitHub username from URL
  const extractGithubUsername = (url) => {
    if (!url) return '';
    const clean = url.trim().replace(/\/$/, '');
    const parts = clean.split('/');
    return parts[parts.length - 1];
  };

  // Registration flow
  const register = async ({ name, githubUrl, password }) => {
    const username = extractGithubUsername(githubUrl);
    if (!username) {
      throw new Error('Please enter a valid GitHub profile URL (e.g. https://github.com/username)');
    }

    const internalEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@dailycommit.club`;

    // Try fetching GitHub avatar
    let avatarUrl = `https://github.com/${username}.png`;
    try {
      const ghRes = await fetch(`https://api.github.com/users/${username}`);
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (ghData.avatar_url) avatarUrl = ghData.avatar_url;
      }
    } catch (e) {
      console.warn('Could not fetch GitHub avatar directly:', e);
    }

    // Supabase auth registration
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: internalEmail,
      password: password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('User registration failed. Please try again.');
    }

    // Insert profile into database
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      name: name.trim(),
      github_url: githubUrl.trim(),
      github_username: username,
      github_avatar_url: avatarUrl,
      internal_email: internalEmail,
      current_streak: 0,
      longest_streak: 0,
      coffee_debt: 0
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Profile setup failed: ${profileError.message}`);
    }

    setUser(authData.user);
    await fetchProfile(authData.user.id);
    return authData.user;
  };

  // Login flow by Name / Username
  const login = async ({ name, password }) => {
    const inputClean = name.trim();
    
    // Resolve email via RPC function
    const { data: emailData, error: rpcError } = await supabase.rpc('get_login_email', {
      user_identifier: inputClean
    });

    let targetEmail = null;
    if (emailData && emailData.length > 0 && emailData[0].email) {
      targetEmail = emailData[0].email;
    } else {
      // Fallback: construct internal email if username matches pattern
      const usernameClean = inputClean.toLowerCase().replace(/[^a-z0-9]/g, '');
      targetEmail = `${usernameClean}@dailycommit.club`;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: password
    });

    if (authError) {
      throw new Error('Invalid name or password.');
    }

    setUser(authData.user);
    await fetchProfile(authData.user.id);
    return authData.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
