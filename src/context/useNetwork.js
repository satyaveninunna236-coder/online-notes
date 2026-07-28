import { useContext } from 'react';
import { NetworkContext } from './network-context';
export const useNetwork = () => { const value = useContext(NetworkContext); if (!value) throw new Error('useNetwork must be used within NetworkProvider'); return value; };
