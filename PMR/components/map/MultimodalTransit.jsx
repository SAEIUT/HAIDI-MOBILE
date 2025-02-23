import React, { useState } from 'react';
import { Search, RotateCcw, Calendar, Clock } from 'lucide-react';
import PlaceSearch from './PlaceSearch';
import TransportModeSelector from './TransportModeSelector';
import JourneySummary from './JourneySummary';
import MapComponent from '../../app/(TabBar)/map/Maps';
import TransportService from '../../app/services/TransportService';

const MultimodalTransit = () => {
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [selectedArrival, setSelectedArrival] = useState(null);
    const [selectedModes, setSelectedModes] = useState(['train', 'bus', 'car', 'plane']);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [journeys, setJourneys] = useState([]);
    const [selectedJourney, setSelectedJourney] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!selectedDeparture || !selectedArrival) {
            setError('Veuillez sélectionner un point de départ et une destination');
            return;
        }

        if (selectedModes.length === 0) {
            setError('Veuillez sélectionner au moins un mode de transport');
            return;
        }

        setLoading(true);
        setError(null);

        const searchDate = new Date();
        if (date && time) {
            const [hours, minutes] = time.split(':');
            searchDate.setHours(parseInt(hours), parseInt(minutes));
        }

        try {
            const allJourneys = await TransportService.getMultiModalRoute(
                selectedDeparture,
                selectedArrival,
                selectedModes
            );

            if (allJourneys.length > 0) {
                setJourneys(allJourneys);
                setSelectedJourney(allJourneys[0]);
            } else {
                setError('Aucun itinéraire trouvé pour ces critères');
            }
        } catch (error) {
            console.error('Erreur recherche:', error);
            setError('Une erreur est survenue lors de la recherche d\'itinéraires');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setDeparture('');
        setArrival('');
        setSelectedDeparture(null);
        setSelectedArrival(null);
        setSelectedJourney(null);
        setJourneys([]);
        setError(null);
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Barre de recherche en haut */}
            <div className="w-full bg-white shadow-md p-4 space-y-4">
                <h1 className="text-xl font-bold">Planificateur d'itinéraire</h1>

                <TransportModeSelector
                    selectedModes={selectedModes}
                    onModeToggle={(mode) => {
                        setSelectedModes(prev =>
                            prev.includes(mode)
                                ? prev.filter(m => m !== mode)
                                : [...prev, mode]
                        );
                    }}
                />

                <div className="space-y-4">
                    <PlaceSearch
                        value={departure}
                        onChange={setDeparture}
                        onPlaceSelect={setSelectedDeparture}
                        placeholder="Point de départ"
                    />
                    <PlaceSearch
                        value={arrival}
                        onChange={setArrival}
                        onPlaceSelect={setSelectedArrival}
                        placeholder="Destination"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full pl-12 pr-4 py-3 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold
                            hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span>Recherche...</span>
                        ) : (
                            <>
                                <Search className="h-5 w-5" />
                                <span>Rechercher</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <RotateCcw className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Carte en dessous de la barre de recherche */}
            <div className="flex-1">
                <MapComponent
                    selectedDeparture={selectedDeparture}
                    selectedArrival={selectedArrival}
                    selectedJourney={selectedJourney}
                />
            </div>

            {/* Affichage des itinéraires disponibles */}
            {journeys.length > 0 && (
                <div className="w-full bg-white shadow-md p-4 space-y-4">
                    <h2 className="font-semibold">
                        Itinéraires disponibles ({journeys.length})
                    </h2>
                    {journeys.map((journey) => (
                        <JourneySummary
                            key={journey.id}
                            journey={journey}
                            isSelected={selectedJourney?.id === journey.id}
                            onClick={() => setSelectedJourney(journey)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultimodalTransit;