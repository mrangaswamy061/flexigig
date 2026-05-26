import React, { useEffect, useRef } from 'react';

const RealMap = ({ jobs = [], center, selectedJob, appliedJob, userRole, employerJob, studentLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(center, 13);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    map.setView(center, 13);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView(center, 13);
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

    const studentIcon = window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Add student center marker
    if (userRole === 'student') {
      const locationText = studentLocation && studentLocation !== 'Campus Center' ? studentLocation : 'Exact Detected Location';
      const centerMarker = window.L.marker(center, { icon: studentIcon }).addTo(map)
        .bindPopup(`<b>Your Location</b><br/>${locationText}`);
      markersRef.current.push(centerMarker);
    }

    if (userRole === 'employer' && studentLocation && employerJob) {
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
      jobs.forEach(job => {
        if (!job.latlng) return;
        const marker = window.L.marker(job.latlng, { icon: myIcon }).addTo(map);
        
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
