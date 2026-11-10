const axios = require('axios');
const Hospital = require('../models/Hospital');

// Maps emergency category to standard specialist types matching the enum in Hospital model
const SPECIALIST_CONFIG = {
  cardiac: { type: 'cardiologist', title: 'Cardiologist' },
  trauma: { type: 'trauma surgeon', title: 'Trauma Surgeon' },
  stroke: { type: 'neurologist', title: 'Neurologist' },
  burns: { type: 'burn specialist', title: 'Burn Specialist' },
  respiratory: { type: 'pulmonologist', title: 'Pulmonologist' },
  other: { type: 'general', title: 'Emergency Physician' },
  general: { type: 'general', title: 'Emergency Physician' }
};

// Generates pseudo-random, consistent attributes for dynamically fetched hospitals
function synthesizeHospitalAttributes(osmItem, index, emergencyType) {
  const rawName = osmItem.display_name ? osmItem.display_name.split(',')[0].trim() : 'Emergency Medical Center';
  const name = rawName.length < 3 || rawName.toLowerCase() === 'hospital' 
    ? `City Hospital #${index + 1}` 
    : rawName;

  // Clean, truncated address
  const addressParts = (osmItem.display_name || '').split(',').map(s => s.trim());
  const address = addressParts.slice(1, 4).join(', ') || osmItem.display_name || 'Emergency Medical Center';

  const lat = Number(osmItem.lat);
  const lon = Number(osmItem.lon);

  // Generate realistic seed numbers based on coordinates
  const seed = Math.abs(Math.round((lat + lon) * 1000 + index));
  const totalICUBeds = 15 + (seed % 25); // 15 to 39
  const availableICUBeds = Math.max(1, 2 + (seed % (totalICUBeds - 5))); // 1 to total
  const currentLoad = 2 + (seed % 7); // 2 to 8
  const phone = `98${String(10000000 + (seed % 89999999)).slice(0, 8)}`;

  const specInfo = SPECIALIST_CONFIG[emergencyType] || SPECIALIST_CONFIG.general;
  const specialists = [
    {
      name: `Dr. Sample ${specInfo.title}`,
      type: specInfo.type,
      available: (seed % 5) !== 0 // 80% chance available
    },
    {
      name: 'Dr. Sample Generalist',
      type: 'general',
      available: true
    }
  ];

  return {
    name,
    address,
    phone,
    location: {
      type: 'Point',
      coordinates: [lon, lat]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'respiratory', 'burns', 'general', 'other'],
    totalICUBeds,
    availableICUBeds,
    emergencyDeptOpen: true,
    currentLoad,
    specialists,
    lastUpdated: new Date()
  };
}

/**
 * Dynamically fetches real hospitals around the user's coordinates from OpenStreetMap Nominatim
 * and persists them to the local database so they have real IDs, bed tracking, and alert support.
 */
async function fetchNearbyHospitalsFromOSM(latitude, longitude, emergencyType = 'cardiac') {
  try {
    const lat = Number(latitude);
    const lon = Number(longitude);

    // Bounding box for approx 25 km around coordinates (0.22 degrees)
    const delta = 0.22;
    const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
    const url = `https://nominatim.openstreetmap.org/search?q=hospital&format=json&limit=10&bounded=1&viewbox=${viewbox}&addressdetails=1`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'HLERS-Emergency-Prototype/1.0 (emergency-routing-research)'
      },
      timeout: 5000
    });

    const elements = Array.isArray(response.data) ? response.data : [];
    if (elements.length === 0) {
      console.log('No OSM hospitals returned for coordinates:', lat, lon);
      return [];
    }

    const createdHospitals = [];

    for (let i = 0; i < elements.length; i++) {
      const item = elements[i];
      if (!item.lat || !item.lon) continue;

      const hospitalData = synthesizeHospitalAttributes(item, i, emergencyType);

      // Check if this hospital already exists in the local database by name
      let hospital = await Hospital.findOne({ name: hospitalData.name });

      if (!hospital) {
        try {
          hospital = await Hospital.create(hospitalData);
        } catch (saveErr) {
          console.warn('Hospital creation warning:', saveErr.message);
          continue;
        }
      }

      createdHospitals.push(hospital);
    }

    console.log(`Fetched and synced ${createdHospitals.length} live hospitals from OpenStreetMap`);
    return createdHospitals;
  } catch (error) {
    console.error('Error fetching live hospitals from OpenStreetMap:', error.message);
    return [];
  }
}

module.exports = {
  fetchNearbyHospitalsFromOSM
};
