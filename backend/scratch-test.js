import fetch from 'node-fetch';

async function testPost() {
  const newJob = {
    title: 'Test Job Title',
    description: 'This is a test job description',
    dept: 'Test Department',
    location: 'Local Area',
    pay: '₹300/hr',
    startTime: '2026-06-06T17:00',
    endTime: '2026-06-06T18:00',
    duration: '2026-06-06T17:00 to 2026-06-06T18:00',
    employerType: 'Local Business',
    type: 'In Person',
    tags: [],
    latlng: [28.6139, 77.2090],
    coordinates: { x: 50, y: 50 },
    postedByEmail: 'employer@example.com'
  };

  try {
    const res = await fetch('http://localhost:5004/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob)
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testPost();
