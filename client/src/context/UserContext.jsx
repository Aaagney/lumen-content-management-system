import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const USERS = [
  { name: 'Priya Mehta', role: 'author' },
  { name: 'Thomas Okeke', role: 'author' },
  { name: 'Amara Silva', role: 'admin' },
  { name: 'Lena Kaufmann', role: 'reader' }
];

const getInitialsFromName = (name) => {
  if (!name) return 'LK';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem('lumenUser') || 'Lena Kaufmann';
  });

  const initials = getInitialsFromName(currentUser);

  useEffect(() => {
    sessionStorage.setItem('lumenUser', currentUser);
    sessionStorage.setItem('lumenInitials', initials);
  }, [currentUser, initials]);

  const isReader = currentUser === 'Lena Kaufmann';

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, initials, isReader, USERS }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
