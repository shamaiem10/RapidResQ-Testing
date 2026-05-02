const fetch = require('node-fetch');

// Pakistan fallback data
const fallbackData = {
  hospitals: [
    { name: 'Pakistan Institute of Medical Sciences (PIMS)', phone: '+92-51-9260601', address: 'G-8/3, Islamabad', lat: 33.6693, lon: 73.0762, amenity: 'hospital' },
    { name: 'Shifa International Hospital', phone: '+92-51-8464646', address: 'Sector H-8/4, Islamabad', lat: 33.6566, lon: 73.0645, amenity: 'hospital' },
    { name: 'Armed Forces Institute of Cardiology', phone: '+92-51-9271858', address: 'Rawalpindi', lat: 33.6007, lon: 73.0679, amenity: 'hospital' },
    { name: 'Holy Family Hospital', phone: '+92-51-5560394', address: 'Rawalpindi', lat: 33.5939, lon: 73.0479, amenity: 'hospital' },
    { name: 'Combined Military Hospital (CMH)', phone: '+92-51-9270463', address: 'Rawalpindi', lat: 33.5951, lon: 73.0560, amenity: 'hospital' },
    { name: 'Benazir Bhutto Hospital', phone: '+92-51-9290301', address: 'Rawalpindi', lat: 33.5978, lon: 73.0444, amenity: 'hospital' },
    { name: 'Poly Clinic Hospital', phone: '+92-51-9218944', address: 'G-6/2, Islamabad', lat: 33.6944, lon: 73.0638, amenity: 'hospital' },
    { name: 'Capital Hospital CDA', phone: '+92-51-9252371', address: 'G-6/4, Islamabad', lat: 33.6889, lon: 73.0583, amenity: 'hospital' }
  ],
  emergencyServices: [
    { name: 'Pakistan Police Emergency', phone: '15', address: 'Nationwide', lat: 33.6362, lon: 72.9837, amenity: 'police' },
    { name: 'Rescue 1122', phone: '1122', address: 'Emergency Medical Services', lat: 33.6362, lon: 72.9837, amenity: 'ambulance_station' },
    { name: 'Fire Brigade', phone: '16', address: 'Fire Emergency', lat: 33.6362, lon: 72.9837, amenity: 'fire_station' },
    { name: 'Motorway Police', phone: '130', address: 'Highway Emergency', lat: 33.6362, lon: 72.9837, amenity: 'police' }
  ]
};

// Free Nominatim search for places
async function searchNominatim(lat, lon, amenity, radius = 25000) {
  try {
    const radiusKm = Math.min(radius / 1000, 50); // Convert to km, max 50km
    const url = `https://nominatim.openstreetmap.org/search?format=json&amenity=${amenity}&lat=${lat}&lon=${lon}&bounded=1&viewbox=${lon-0.5},${lat+0.5},${lon+0.5},${lat-0.5}&limit=20`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RapidResq Emergency App (https://github.com/shamaiem10/RapidResq)'
      }
    });
    
    if (!response.ok) {
      console.log('Nominatim API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.filter(place => {
      const distance = calculateDistance(lat, lon, parseFloat(place.lat), parseFloat(place.lon));
      return distance <= radiusKm;
    }).map(place => ({
      id: place.place_id,
      type: 'nominatim',
      name: place.display_name.split(',')[0],
      amenity: amenity,
      phone: null,
      address: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon)
    }));
  } catch (error) {
    console.log('Nominatim API error:', error.message);
    return [];
  }
}

// Improved Overpass query with more comprehensive search
async function searchOverpass(lat, lon, radius) {
  try {
    const query = `[out:json][timeout:25];
    (
      node["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
      way["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
      relation["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
      node["amenity"~"^(police|fire_station)$"](around:${radius},${lat},${lon});
      way["amenity"~"^(police|fire_station)$"](around:${radius},${lat},${lon});
      relation["amenity"~"^(police|fire_station)$"](around:${radius},${lat},${lon});
      node["healthcare"~"^(hospital|clinic)$"](around:${radius},${lat},${lon});
      way["healthcare"~"^(hospital|clinic)$"](around:${radius},${lat},${lon});
    );
    out center geom;`;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'RapidResq Emergency App'
      }
    });

    if (!response.ok) {
      console.log('Overpass API error:', response.status);
      return { hospitals: [], emergencyServices: [] };
    }

    const data = await response.json();
    const hospitals = [];
    const emergencyServices = [];

    (data.elements || []).forEach(element => {
      const lat = element.lat || (element.center && element.center.lat);
      const lon = element.lon || (element.center && element.center.lon);
      
      if (!lat || !lon) return;

      const item = {
        id: element.id,
        type: element.type,
        name: element.tags?.name || element.tags?.['name:en'] || 'Unnamed',
        amenity: element.tags?.amenity || element.tags?.healthcare,
        phone: element.tags?.phone || element.tags?.['contact:phone'] || element.tags?.['emergency:phone'],
        address: [
          element.tags?.['addr:housenumber'],
          element.tags?.['addr:street'],
          element.tags?.['addr:city']
        ].filter(Boolean).join(', ') || null,
        lat,
        lon
      };

      if (['hospital', 'clinic', 'doctors', 'pharmacy'].includes(item.amenity)) {
        hospitals.push(item);
      } else if (['police', 'fire_station'].includes(item.amenity)) {
        emergencyServices.push(item);
      }
    });

    return { hospitals, emergencyServices };
  } catch (error) {
    console.log('Overpass error:', error.message);
    return { hospitals: [], emergencyServices: [] };
  }
}

// Check if coordinates are in Pakistan
function isInPakistan(lat, lon) {
  return lat >= 23.5 && lat <= 37.5 && lon >= 60.5 && lon <= 77.5;
}

// Validate lat/lon
function isValidCoords(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// GET /api/emergency/nearby?lat=..&lon=..&radius=25000
async function getNearby(req, res) {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const radius = Math.min(Math.max(parseInt(req.query.radius || '25000', 10), 500), 50000);

  if (!isValidCoords(lat, lon)) {
    return res.status(400).json({ success: false, message: 'Invalid coordinates' });
  }

  try {
    let hospitals = [];
    let emergencyServices = [];
    let dataSource = 'fallback';

    // Try Overpass API first (completely free)
    console.log('Searching Overpass API...');
    const overpassResults = await searchOverpass(lat, lon, radius);
    
    if (overpassResults.hospitals.length > 0 || overpassResults.emergencyServices.length > 0) {
      hospitals = overpassResults.hospitals;
      emergencyServices = overpassResults.emergencyServices;
      dataSource = 'overpass_osm';
      console.log(`Found ${hospitals.length} hospitals, ${emergencyServices.length} emergency services via Overpass`);
    }

    // If no Overpass results, try Nominatim API (also free)
    if (hospitals.length === 0) {
      console.log('Trying Nominatim API...');
      const [nominatimHospitals, nominatimPolice, nominatimFire] = await Promise.all([
        searchNominatim(lat, lon, 'hospital', radius),
        searchNominatim(lat, lon, 'police', radius),
        searchNominatim(lat, lon, 'fire_station', radius)
      ]);

      if (nominatimHospitals.length > 0 || nominatimPolice.length > 0 || nominatimFire.length > 0) {
        hospitals = nominatimHospitals;
        emergencyServices = [...nominatimPolice, ...nominatimFire];
        dataSource = 'nominatim_osm';
        console.log(`Found ${hospitals.length} hospitals, ${emergencyServices.length} emergency services via Nominatim`);
      }
    }

    // Always include Pakistan fallback data if in Pakistan
    if (isInPakistan(lat, lon)) {
      // Add nearby hospitals from fallback if within range
      const nearbyFallbackHospitals = fallbackData.hospitals.filter(h => {
        const distance = calculateDistance(lat, lon, h.lat, h.lon);
        return distance <= radius / 1000; // Convert to km
      });

      // Merge results: API results + fallback data
      hospitals = [...hospitals, ...nearbyFallbackHospitals];
      emergencyServices = [...emergencyServices, ...fallbackData.emergencyServices];

      // Remove duplicates
      hospitals = hospitals.filter((h, index, self) => 
        index === self.findIndex(t => t.name === h.name)
      );
      emergencyServices = emergencyServices.filter((s, index, self) => 
        index === self.findIndex(t => t.phone === s.phone)
      );
    }

    return res.json({ 
      success: true, 
      hospitals, 
      emergencyServices, 
      radius,
      dataSource: hospitals.length > 0 || emergencyServices.length > 0 ? dataSource : 'fallback_only',
      location: { lat, lon }
    });
  } catch (err) {
    console.error('Emergency services error:', err);
    
    // Final fallback - return Pakistan emergency numbers if in Pakistan
    const emergencyServices = isInPakistan(lat, lon) ? fallbackData.emergencyServices : [];
    
    return res.json({
      success: true,
      hospitals: [],
      emergencyServices,
      radius,
      dataSource: 'emergency_fallback',
      error: 'Limited data available'
    });
  }
}

// Calculate distance between two points in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = { getNearby };
