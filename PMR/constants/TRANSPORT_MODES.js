import { Train, Bus, Car, Plane } from 'lucide-react';

export const TRANSPORT_MODES = {
    TRAIN: {
        id: 'train',
        label: 'Train',
        icon: Train,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        lineColor: '#3b82f6'
    },
    BUS: {
        id: 'bus',
        label: 'Bus',
        icon: Bus,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        lineColor: '#22c55e'
    },
    CAR: {
        id: 'car',
        label: 'Voiture',
        icon: Car,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        lineColor: '#ea580c'
    },
    PLANE: {
        id: 'plane',
        label: 'Avion',
        icon: Plane,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        lineColor: '#9333ea'
    }
};