import React, { createContext, useState, useContext } from 'react';

type User = {
  name: string;
  email: string;
  profileImage: string | null;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  updateProfileImage: (imageUri: string) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  updateProfileImage: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    name: 'Charlotte King',
    email: 'charlotte@gmail.com',
    profileImage: null,
  });

  const updateProfileImage = (imageUri: string) => {
    if (user) {
      setUser({ ...user, profileImage: imageUri });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateProfileImage }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 