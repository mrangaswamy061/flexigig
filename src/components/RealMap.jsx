import React, { useEffect, useRef } from 'react';

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

  if (!center) {
    return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading map...</div>;
  }

  // Initialise Leaflet map only once on mount
  useEffect(() => {
    if (!window.L || !mapRef.current) return;
    const initCenter = center;
    mapInstanceRef.current = window.L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(initCenter, 13);
    window.L.tileLayer(
      import.meta.env.VITE_MAP_TILE_URL,
      { attribution: '&copy; OpenStreetMap contributors' }
    ).addTo(mapInstanceRef.current);
    // Ensure the map container sizes correctly after mount
    setTimeout(() => {
      mapInstanceRef.current && mapInstanceRef.current.invalidateSize();
    }, 500);
  }, []);

  // Update map view when the center prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (center) {
      mapInstanceRef.current.setView(center, 13);
    }
  }, [center]);

  // Update markers, routes and pop‑ups whenever relevant data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const effectiveCenter = center;
    // NOTE: We no longer reset map view here to preserve user interactions.


    // Clear previous markers and routes
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    const myIcon = window.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const employerIcon = window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    const studentIcon = window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Student view – show the student's own location
    if (userRole === 'student') {
      const locationText =
        studentLocation && studentLocation !== 'Campus Center'
          ? studentLocation
          : 'Exact Detected Location';
      const centerMarker = window.L.marker(effectiveCenter, { icon: studentIcon })
        .bindPopup(`<b>Your Location</b><br/>${locationText}`)
        .addTo(map);
      markersRef.current.push(centerMarker);
    }

    // Employer view – show shop, student location and route
    else if (
      userRole === 'employer' &&
      employerJob &&
      employerJob.latlng &&
      Array.isArray(studentLocation) &&
      studentLocation.length === 2
    ) {
      const shopMarker = window.L.marker(employerJob.latlng, { icon: myIcon })
        .bindPopup(`<b>Your Shop</b><br/>${employerJob.title}`)
        .addTo(map);
      markersRef.current.push(shopMarker);

      const studentMarker = window.L.marker(studentLocation, { icon: studentIcon })
        .bindPopup('<b>Student</b><br/>Heading to shop...')
        .addTo(map);
      markersRef.current.push(studentMarker);

      const latlngs = [employerJob.latlng, studentLocation];
      routeRef.current = window.L.polyline(latlngs, {
        color: 'blue',
        dashArray: '5, 10',
      }).addTo(map);
      map.fitBounds(window.L.polyline(latlngs).getBounds());
    }

    // Default view – render all job markers
    else {
      jobs.forEach((job) => {
        if (!job.latlng) return;
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
        markersRef.current.push(marker);
      });
    }

    // If an applied job is selected, draw a green route from the centre
    if (appliedJob && appliedJob.latlng) {
      const latlngs = [effectiveCenter, appliedJob.latlng];
      routeRef.current = window.L.polyline(latlngs, {
        color: 'green',
        dashArray: '5, 10',
      }).addTo(map);
      map.fitBounds(window.L.polyline(latlngs).getBounds());
    }
  }, [jobs, center, selectedJob, appliedJob, userRole, employerJob, studentLocation]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: 'inherit', zIndex: 0 }}
    />
  );
};

export default RealMap;
