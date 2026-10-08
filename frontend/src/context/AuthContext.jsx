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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setLoading(false);
      }
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

  // Helper to extract clean GitHub username from URL or handle raw username
  const extractGithubUsername = (input) => {
    if (!input) return '';
    let clean = input.trim().replace(/\/$/, '');
    if (clean.includes('github.com/')) {
      const parts = clean.split('github.com/');
      clean = parts[parts.length - 1];
    }
    // Remove query params or trailing slashes
    clean = clean.split('?')[0].split('/')[0];
    return clean.trim();
  };

  // Helper to generate deterministic, RFC-valid internal email
  const generateInternalEmail = (githubUsername) => {
    const cleanUser = githubUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `dcc_${cleanUser}@gmail.com`;
  };

  // Registration flow
  const register = async ({ name, githubUrl, password }) => {
    const rawName = name.trim();
    const rawGithubUrl = githubUrl.trim();
    const username = extractGithubUsername(rawGithubUrl);

    if (!username) {
      throw new Error('Please enter a valid GitHub profile URL (e.g. https://github.com/yourusername)');
    }

    const internalEmail = generateInternalEmail(username);
    const formattedGithubUrl = rawGithubUrl.startsWith('http') ? rawGithubUrl : `https://github.com/${username}`;

    // Try fetching GitHub avatar
    let avatarUrl = `https://github.com/${username}.png`;
    try {
      const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (ghData.avatar_url) avatarUrl = ghData.avatar_url;
      }
    } catch (e) {
      console.warn('Could not fetch GitHub avatar directly:', e);
    }

    // Supabase Auth SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: internalEmail,
      password: password,
      options: {
        data: {
          full_name: rawName,
          github_username: username
        }
      }
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already registered') || authError.status === 422) {
        throw new Error('An account with this GitHub profile already exists. Please sign in.');
      }
      if (authError.status === 429 || authError.message?.toLowerCase().includes('rate limit')) {
        // Fallback: If signup triggered email rate limit, attempt sign in or notify user
        throw new Error('Supabase email rate limit reached. If your account was already created, please try signing in.');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Registration failed to return user data. Please try again.');
    }

    // Upsert profile into public.profiles
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      name: rawName,
      github_url: formattedGithubUrl,
      github_username: username,
      github_avatar_url: avatarUrl,
      internal_email: internalEmail,
      current_streak: 0,
      longest_streak: 0,
      coffee_debt: 0
    });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
    }

    setUser(authData.user);
    await fetchProfile(authData.user.id);
    return { user: authData.user, session: authData.session };
  };

  // Login flow by Name / Username
  const login = async ({ name, password }) => {
    const inputClean = name.trim();
    
    // Resolve internal email via get_login_email RPC
    const { data: emailData } = await supabase.rpc('get_login_email', {
      user_identifier: inputClean
    });

    let targetEmail = null;
    if (emailData && emailData.length > 0 && emailData[0].email) {
      targetEmail = emailData[0].email;
    } else {
      const usernameClean = extractGithubUsername(inputClean);
      targetEmail = generateInternalEmail(usernameClean);
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: password
    });

    if (authError) {
      throw new Error('Invalid name/username or password. Please check your credentials.');
    }

    setUser(authData.user);
    await fetchProfile(authData.user.id);
    return authData.user;
  };

  // Forgot password flow
  const resetPassword = async (userIdentifier) => {
    const inputClean = userIdentifier.trim();
    if (!inputClean) {
      throw new Error('Please enter your Name or GitHub username.');
    }

    const { data: emailData } = await supabase.rpc('get_login_email', {
      user_identifier: inputClean
    });

    let targetEmail = null;
    if (emailData && emailData.length > 0 && emailData[0].email) {
      targetEmail = emailData[0].email;
    } else {
      const usernameClean = extractGithubUsername(inputClean);
      targetEmail = generateInternalEmail(usernameClean);
    }

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/`
    });

    if (resetErr) {
      throw new Error(resetErr.message || 'Password reset request failed.');
    }

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      register, 
      login, 
      resetPassword,
      logout, 
      refreshProfile: () => fetchProfile(user?.id) 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
