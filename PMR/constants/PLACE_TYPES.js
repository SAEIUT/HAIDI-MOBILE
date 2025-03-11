import { Home, Train, Bus, Building, Plane } from 'lucide-react';

export const PLACE_TYPES = {
    HOME: {
        id: 'home',
        icon: Home,
        color: 'text-red-600',
        markerColor: '#ef4444'
    },
    STATION: {
        id: 'station',
        icon: Train,
        color: 'text-blue-600',
        markerColor: '#3b82f6'
    },
    BUS_STOP: {
        id: 'bus_stop',
        icon: Bus,
        color: 'text-green-600',
        markerColor: '#22c55e'
    },
    ADDRESS: {
        id: 'address',
        icon: Building,
        color: 'text-gray-600',
        markerColor: '#4b5563'
    },
    AIRPORT: {
        id: 'airport',
        icon: Plane,
        color: 'text-purple-600',
        markerColor: '#9333ea'
    }
};