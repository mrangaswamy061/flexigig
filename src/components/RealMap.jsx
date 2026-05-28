import React, { useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';

// Removed DEFAULT_CENTER constant as it is no longer needed

const RealMap = ({
  jobs = [],
  center,
  selectedJob,
  appliedJob,
  userRole,
  employerJob,
  studentLocation,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);

  // Cleanup map on unmount to prevent "Map container is already initialized" error
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Initialise Leaflet map only when center is available and not yet initialized
  useEffect(() => {
    if (!window.L || !mapRef.current || !center || mapInstanceRef.current) return;
    const initCenter = center;
    try {
      mapInstanceRef.current = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(initCenter, 13);
      window.L.tileLayer(
        import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; OpenStreetMap contributors' }
      ).addTo(mapInstanceRef.current);
      // Ensure the map container sizes correctly after mount
      setTimeout(() => {
        mapInstanceRef.current && mapInstanceRef.current.invalidateSize();
      }, 500);
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
    }
  }, [center]);

  // Update map view when the center prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;
    try {
      mapInstanceRef.current.setView(center, 13);
    } catch (err) {
      console.error('Failed to set Leaflet view:', err);
    }
  }, [center]);

  // Update markers, routes and pop‑ups whenever relevant data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const effectiveCenter = center;

    // Clear previous markers and routes
    markersRef.current.forEach((m) => {
      try {
        map.removeLayer(m);
      } catch (_) {}
    });
    markersRef.current = [];
    if (routeRef.current) {
      try {
        map.removeLayer(routeRef.current);
      } catch (_) {}
      routeRef.current = null;
    }

    // Leaflet icons
    let myIcon, employerIcon, studentIcon;
    try {
      myIcon = window.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      employerIcon = window.L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      studentIcon = window.L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    } catch (iconErr) {
      console.error('Failed to create Leaflet icons:', iconErr);
      return;
    }

    const hasValidCenter = Array.isArray(effectiveCenter) && effectiveCenter.length === 2 && !isNaN(effectiveCenter[0]) && !isNaN(effectiveCenter[1]);

    // 1. Show the student's own location if role is student
    if (userRole === 'student' && hasValidCenter) {
      const locationText =
        studentLocation && studentLocation !== 'Campus Center'
          ? studentLocation
          : 'Exact Detected Location';
      try {
        const centerMarker = window.L.marker(effectiveCenter, { icon: studentIcon })
          .bindPopup(`<b>Your Location</b><br/>${locationText}`)
          .addTo(map);
        markersRef.current.push(centerMarker);
      } catch (err) {
        console.error('Failed to add student marker:', err);
      }
    }

    // 2. Show ONLY the student's location if role is employer
    if (
      userRole === 'employer' &&
      Array.isArray(studentLocation) &&
      studentLocation.length === 2 &&
      !isNaN(studentLocation[0]) &&
      !isNaN(studentLocation[1])
    ) {
      try {
        const studentMarker = window.L.marker(studentLocation, { icon: studentIcon })
          .bindPopup('<b>Student Location</b><br/>Live Tracking Active')
          .addTo(map);
        markersRef.current.push(studentMarker);
      } catch (err) {
        console.error('Failed to add student marker in employer view:', err);
      }
    }

    // 3. Show all jobs if it is NOT employer view (i.e. student or default view!)
    if (userRole !== 'employer') {
      jobs.forEach((job) => {
        if (!job.latlng || !Array.isArray(job.latlng) || job.latlng.length !== 2 || isNaN(job.latlng[0]) || isNaN(job.latlng[1])) return;
        try {
          const markerIcon = job.employerType === 'Local Business' ? employerIcon : myIcon;
          const marker = window.L.marker(job.latlng, { icon: markerIcon })
            .bindPopup(`
              <div style="font-family: 'Outfit', sans-serif;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px;">${job.title}</h3>
                <p style="margin: 0 0 3px 0; font-size: 13px;"><b>Company:</b> ${job.dept}</p>
                <p style="margin: 0 0 3px 0; font-size: 13px;"><b>Work Hour:</b> ${job.duration}</p>
                <p style="margin: 0 0 3px 0; font-size: 13px;"><b>Time:</b> Flexible</p>
                <p style="margin: 0 0 0 0; font-size: 13px; color: #10b981; font-weight: bold;"><b>Payment:</b> ${job.pay}</p>
              </div>
            `);
          if (selectedJob && selectedJob.id === job.id) {
            marker.openPopup();
          }
          marker.addTo(map);
          markersRef.current.push(marker);
        } catch (err) {
          console.error('Failed to add job marker:', err);
        }
      });
    }

    // 4. If an applied job is selected, draw a green route from the centre without moving focus
    if (appliedJob && appliedJob.latlng && Array.isArray(appliedJob.latlng) && appliedJob.latlng.length === 2 && !isNaN(appliedJob.latlng[0]) && !isNaN(appliedJob.latlng[1]) && hasValidCenter) {
      try {
        const latlngs = [effectiveCenter, appliedJob.latlng];
        routeRef.current = window.L.polyline(latlngs, {
          color: 'green',
          dashArray: '5, 10',
        }).addTo(map);
        // Removed fitBounds to ensure map focus remains entirely centered on the student's location
      } catch (err) {
        console.error('Failed to draw applied job route:', err);
      }
    }
  }, [jobs, center, selectedJob, appliedJob, userRole, employerJob, studentLocation]);

  if (!center) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '600px', borderRadius: 'inherit', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader className="lucide-spin" size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>Detecting location and loading radar...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: 'inherit', zIndex: 0 }}
    />
  );
};

export default RealMap;
