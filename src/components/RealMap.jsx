import React, { useEffect, useRef, useState } from 'react';

const RealMap = ({ jobs = [], center, selectedJob, appliedJob, userRole, employerJob, studentLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to New Delhi fallback
  const markersRef = useRef([]);
  const routeRef = useRef(null);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;
    const effectiveCenter = center || [28.6139, 77.2090];

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      });
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    map.setView(effectiveCenter, 13);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView(effectiveCenter, 13);
      }
    }, 500);

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
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
      shadowSize: [41, 41]
    });

    // Distinct icon for employer posted local business gigs
    const employerIcon = window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    const studentIcon = window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Add student center marker if center is available
    if (userRole === 'student' && effectiveCenter) {
      const locationText = studentLocation && studentLocation !== 'Campus Center' ? studentLocation : 'Exact Detected Location';
      const centerMarker = window.L.marker(effectiveCenter, { icon: studentIcon }).addTo(map)
        .bindPopup(`<b>Your Location</b><br/>${locationText}`);
      markersRef.current.push(centerMarker);
    }

    // Employer view logic with safety checks
    if (userRole === 'employer' && employerJob && employerJob.latlng && Array.isArray(studentLocation) && studentLocation.length === 2) {
      // Employer sees their shop and the student's location
      const shopMarker = window.L.marker(employerJob.latlng, { icon: myIcon }).addTo(map)
        .bindPopup(`<b>Your Shop</b><br/>${employerJob.title}`);
      markersRef.current.push(shopMarker);

      const sMarker = window.L.marker(studentLocation, { icon: studentIcon }).addTo(map)
        .bindPopup(`<b>Student</b><br/>Heading to shop...`);
      markersRef.current.push(sMarker);

      // Route
      const latlngs = [employerJob.latlng, studentLocation];
      routeRef.current = window.L.polyline(latlngs, { color: 'blue', dashArray: '5, 10' }).addTo(map);
      map.fitBounds(window.L.polyline(latlngs).getBounds());
    } else {
      // Existing job markers logic (unchanged)
    }
    } else {
      jobs.forEach(job => {
        if (!job.latlng) return;
        const markerIcon = (job.employerType === 'Local Business') ? employerIcon : myIcon;
        const marker = window.L.marker(job.latlng, { icon: markerIcon }).addTo(map);
        
        const popupContent = `
          <div style="font-family: 'Outfit', sans-serif;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px;">${job.title}</h3>
            <p style="margin: 0 0 3px 0; font-size: 13px;"><b>Company:</b> ${job.dept}</p>
            <p style="margin: 0 0 3px 0; font-size: 13px;"><b>Work Hour:</b> ${job.duration}</p>
            <p style="margin: 0 0 3px 0; font-size: 13px;"><b>Time:</b> Flexible</p>
            <p style="margin: 0 0 0 0; font-size: 13px; color: #10b981; font-weight: bold;"><b>Payment:</b> ${job.pay}</p>
          </div>
        `;
        marker.bindPopup(popupContent);
        
        if (selectedJob && selectedJob.id === job.id) {
          marker.openPopup();
        }

        markersRef.current.push(marker);
      });

      if (appliedJob && appliedJob.latlng) {
        const latlngs = [center, appliedJob.latlng];
        routeRef.current = window.L.polyline(latlngs, { color: 'green', dashArray: '5, 10' }).addTo(map);
        map.fitBounds(window.L.polyline(latlngs).getBounds());
      }
    }

  }, [jobs, center, selectedJob, appliedJob, userRole, employerJob, studentLocation]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: 'inherit', zIndex: 0 }} />;
};

export default RealMap;
