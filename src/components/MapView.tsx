import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ToiletPoint } from '@/types';

import 'leaflet/dist/leaflet.css';

const ODOR_COLORS: Record<number, string> = {
  1: '#059669',
  2: '#10b981',
  3: '#f59e0b',
  4: '#ef4444',
  5: '#dc2626',
};

interface MapViewProps {
  points: ToiletPoint[];
  onPointClick: (point: ToiletPoint) => void;
}

export default function MapView({ points, onPointClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [39.95, 116.38],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    points.forEach((point) => {
      const color = ODOR_COLORS[point.odorLevel] || '#6b7280';
      const radius = point.odorLevel >= 4 ? 12 : point.odorLevel >= 3 ? 9 : 7;

      const marker = L.circleMarker([point.latitude, point.longitude], {
        radius,
        fillColor: point.isOpen ? color : '#9ca3af',
        color: point.isOpen ? color : '#6b7280',
        weight: point.odorLevel >= 4 ? 3 : 2,
        opacity: point.isOpen ? 1 : 0.5,
        fillOpacity: point.isOpen ? 0.8 : 0.3,
      })
        .addTo(map)
        .bindTooltip(
          `<div style="font-size:12px;line-height:1.5">
            <strong>${point.name}</strong><br/>
            ${point.isOpen ? '🟢 开放' : '🔴 关闭'} · 异味: ${'★'.repeat(point.odorLevel)}<br/>
            状态: ${point.cleanStatus === 'clean' ? '清洁' : point.cleanStatus === 'normal' ? '一般' : '脏乱'}
          </div>`,
          { direction: 'top', offset: [0, -10] }
        )
        .on('click', () => onPointClick(point));

      if (point.odorLevel >= 4 && point.isOpen) {
        const pulse = L.circleMarker([point.latitude, point.longitude], {
          radius: 18,
          fillColor: 'transparent',
          color: color,
          weight: 2,
          opacity: 0.6,
          fillOpacity: 0,
        }).addTo(map);
        markersRef.current.push(pulse);
      }

      markersRef.current.push(marker);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, onPointClick]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px]" />;
}
