'use client';
import React, { createContext, useContext, useState } from 'react';

type User = {
	id: number;
	name: string;
	email: string;
	role: string;
	avatar?: string;
	address?: string;
	phone?: string;
	id_pdp?: number;
	id_provinsi?: number;
	id_kabupaten?: number;
};

type UserContextType = {
	user: User | null;
	setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};
