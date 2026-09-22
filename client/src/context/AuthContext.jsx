import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const USERS = [
  {
    id: 1,
    name: 'Priya Mehta',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Science communicator & neuroscientist writing about how technology shapes human biology.'
  },
  {
    id: 2,
    name: 'Thomas Okeke',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Technology historian and computer science researcher.'
  },
  {
    id: 3,
    name: 'Amara Silva',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Senior editorial manager overseeing quality and standards.'
  },
  {
    id: 4,
    name: 'Lena Kaufmann',
    role: 'reader',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Avid reader and tech enthusiast.'
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lumen_user_id');
    if (saved) {
      const found = USERS.find(u => u.id === parseInt(saved, 10));
      if (found) return found;
    }
    return USERS[0]; // Default to Priya Mehta (author)
  });

  // Keep axios headers synchronized with currentUser
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lumen_user_id', currentUser.id.toString());
      axios.defaults.headers.common['x-user-id'] = currentUser.id.toString();
    }
  }, [currentUser]);

  const switchUser = (roleStringOrId) => {
    let user = null;
    if (typeof roleStringOrId === 'number' || !isNaN(parseInt(roleStringOrId, 10))) {
      user = USERS.find(u => u.id === parseInt(roleStringOrId, 10));
    } else {
      user = USERS.find(u => `${u.name} (${u.role})` === roleStringOrId || u.name === roleStringOrId);
    }
    if (user) {
      setCurrentUser(user);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, isAdmin, users: USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
