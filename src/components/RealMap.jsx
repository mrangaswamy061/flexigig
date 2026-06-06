import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { Loader } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: 'inherit'
};

const RealMap = ({
  jobs = [],
  center,
  selectedJob,
  appliedJob,
  userRole,
  employerJob,
  studentLocation,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setLoadFailed(true);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const effectiveCenter = center ? { lat: center[0], lng: center[1] } : { lat: 28.6139, lng: 77.2090 };
  const hasValidCenter = center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1]);

  if (loadFailed && !isLoaded) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: 'inherit', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Map Offline</span>
        <span style={{ fontSize: '0.9rem' }}>Google Maps could not be loaded. Please check your internet connection.</span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '600px', borderRadius: 'inherit', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader className="lucide-spin" size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>Loading Google Maps...</span>
        </div>
      </div>
    );
  }

  // Icons
  const studentIcon = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
  const myIcon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  const employerIcon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={effectiveCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
          { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
          { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
          { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
        ]
      }}
    >
      {/* 1. Show the student's own location if role is student */}
      {userRole === 'student' && hasValidCenter && (
        <Marker 
          position={effectiveCenter} 
          icon={studentIcon}
          onClick={() => setActiveMarker('student')}
        >
          {activeMarker === 'student' && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div style={{ color: 'black' }}>
                <b>Your Location</b><br/>{studentLocation && studentLocation !== 'Campus Center' ? studentLocation : 'Exact Detected Location'}
              </div>
            </InfoWindow>
          )}
        </Marker>
      )}

      {/* 2. Show ONLY the student's location if role is employer */}
      {userRole === 'employer' && studentLocation && Array.isArray(studentLocation) && (
        <Marker 
          position={{ lat: studentLocation[0], lng: studentLocation[1] }} 
          icon={studentIcon}
          onClick={() => setActiveMarker('student_employer')}
        >
          {activeMarker === 'student_employer' && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div style={{ color: 'black' }}>
                <b>Student Location</b><br/>Live Tracking Active
              </div>
            </InfoWindow>
          )}
        </Marker>
      )}

      {/* 3. Show all jobs if it is NOT employer view */}
      {userRole !== 'employer' && jobs.map((job, idx) => {
        if (!job.latlng || !Array.isArray(job.latlng) || job.latlng.length !== 2) return null;
        const jobId = job.id || job._id || `job-marker-${idx}`;
        const isSelected = (selectedJob && (selectedJob.id === jobId || selectedJob._id === jobId)) || activeMarker === jobId;
        return (
          <Marker
            key={jobId}
            position={{ lat: job.latlng[0], lng: job.latlng[1] }}
            icon={job.employerType === 'Local Business' ? employerIcon : myIcon}
            onClick={() => setActiveMarker(jobId)}
          >
            {isSelected && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ fontFamily: "'Outfit', sans-serif", color: 'black' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{job.title}</h3>
                  <p style={{ margin: '0 0 3px 0', fontSize: '13px' }}><b>Company:</b> {job.dept}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '13px' }}><b>Work Hour:</b> {job.duration}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '13px' }}><b>Time:</b> Flexible</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}><b>Payment:</b> {job.pay}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}

      {/* 4. If an applied job is selected, draw a route */}
      {appliedJob && appliedJob.latlng && Array.isArray(appliedJob.latlng) && hasValidCenter && (
        <Polyline
          path={[effectiveCenter, { lat: appliedJob.latlng[0], lng: appliedJob.latlng[1] }]}
          options={{
            strokeColor: '#10b981',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default React.memo(RealMap);
