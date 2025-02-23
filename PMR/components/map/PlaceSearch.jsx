import React, { useState, useRef } from 'react';
import { MapPin, Home, Train, Bus, Building, Plane } from 'lucide-react';
import { PLACE_TYPES } from '../../constants/PLACE_TYPES';
import TransportService from '../../app/services/TransportService';

const PlaceSearch = ({ value, onChange, onPlaceSelect, placeholder }) => {
    // États pour gérer les suggestions et leur affichage
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Références pour gérer les timeouts et les clics en dehors des suggestions
    const searchTimeout = useRef(null);
    const suggestionsRef = useRef(null);

    // Fonction pour gérer la recherche
    const handleSearch = async (query) => {
        onChange(query); // Met à jour la valeur de l'input
        if (searchTimeout.current) clearTimeout(searchTimeout.current); // Annule le timeout précédent

        // Si la requête est trop courte, on ne fait rien
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        // Déclenche la recherche après un délai de 300ms
        searchTimeout.current = setTimeout(async () => {
            try {
                // Recherche simultanée des gares et des adresses
                const [stations, addresses] = await Promise.all([
                    TransportService.searchStations(query),
                    TransportService.searchAddress(query)
                ]);
                // Combine les résultats et met à jour les suggestions
                setSuggestions([...stations, ...addresses]);
            } catch (error) {
                console.error('Erreur recherche:', error);
                setSuggestions([]); // En cas d'erreur, on vide les suggestions
            }
        }, 300);
    };

    // Fonction pour gérer la perte de focus de l'input
    const handleBlur = (e) => {
        // Ne ferme les suggestions que si le clic n'est pas sur une suggestion
        if (!suggestionsRef.current?.contains(e.relatedTarget)) {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative">
            {/* Input de recherche */}
            <div className="flex items-center border rounded-lg bg-white">
                <MapPin className="ml-3 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className="w-full p-3 rounded-lg focus:outline-none"
                />
            </div>

            {/* Affichage des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((place) => {
                        // Détermine l'icône et la couleur en fonction du type de lieu
                        const placeType = PLACE_TYPES[place.type.toUpperCase()];
                        const Icon = placeType?.icon || MapPin;

                        return (
                            <button
                                key={place.id}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                                onClick={() => {
                                    onChange(place.name); // Met à jour l'input avec le nom du lieu
                                    onPlaceSelect(place); // Transmet le lieu sélectionné au parent
                                    setShowSuggestions(false); // Cache les suggestions
                                    setSuggestions([]); // Vide les suggestions
                                }}
                                tabIndex={0}
                            >
                                <Icon className={`h-4 w-4 mr-2 ${placeType?.color || 'text-gray-400'}`} />
                                <span>{place.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PlaceSearch;