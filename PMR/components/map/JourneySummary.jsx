import React from 'react';
import { Clock, RotateCcw, ChevronRight } from 'lucide-react';
import { TRANSPORT_MODES } from '../../constants/TRANSPORT_MODES';
import { formatDuration, formatDistance, formatPrice, formatTime } from '../../app/utils/formatters';

const JourneySummary = ({ journey, isSelected, onClick }) => {
    const isMultimodal = journey.mode === 'multimodal' || journey.segments.length > 1;
    const uniqueModes = Array.from(new Set(journey.segments.map(s => s.mode)));

    return (
        <div
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
            }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-medium">
                        {formatTime(journey.departureTime)} - {formatTime(journey.arrivalTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                        Durée: {formatDuration(journey.duration)}
                        {journey.distance && ` • ${formatDistance(journey.distance)}`}
                    </div>
                    <div className="text-sm font-medium text-blue-600 mt-1">
                        {formatPrice(journey.price)}
                        {journey.returnable &&
                            <span className="ml-2 text-green-600">
                                (Remboursable)
                                <RotateCcw className="h-4 w-4 inline ml-1" />
                            </span>
                        }
                    </div>
                </div>
                <div className={`p-2 rounded-lg ${isMultimodal ? 'bg-gray-100' : TRANSPORT_MODES[journey.mode.toUpperCase()]?.bgColor}`}>
                    <div className="flex gap-1">
                        {uniqueModes.map((mode, index) => (
                            React.createElement(TRANSPORT_MODES[mode.toUpperCase()].icon, {
                                key: index,
                                className: `h-5 w-5 ${TRANSPORT_MODES[mode.toUpperCase()].color}`
                            })
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-3 text-sm space-y-1">
                {journey.segments.map((segment, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                        {React.createElement(
                            TRANSPORT_MODES[segment.mode.toUpperCase()].icon,
                            { className: "h-4 w-4" }
                        )}
                        <span>
                            {segment.mode === 'train' && segment.train_number &&
                                `Train ${segment.train_number} • `
                            }
                            {segment.from.name}
                            <ChevronRight className="h-4 w-4 inline mx-1" />
                            {segment.to.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JourneySummary;