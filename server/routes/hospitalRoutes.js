const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { getMLScores } = require('../services/mlService');
const { fetchNearbyHospitalsFromOSM } = require('../services/placesService');

function haversineMeters(latitude, longitude, hospitalCoordinates) {
  const [hospitalLongitude, hospitalLatitude] = hospitalCoordinates;
  const radians = (degrees) => degrees * Math.PI / 180;
  const dLatitude = radians(hospitalLatitude - latitude);
  const dLongitude = radians(hospitalLongitude - longitude);
  const a = Math.sin(dLatitude / 2) ** 2
    + Math.cos(radians(latitude)) * Math.cos(radians(hospitalLatitude))
    * Math.sin(dLongitude / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find({});

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospitals',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospital',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating hospital',
    });
  }
});

router.patch('/:id/capacity', async (req, res) => {
  try {
    const allowedFields = [
      'availableICUBeds',
      'currentLoad',
      'emergencyDeptOpen',
      'specialists',
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    updates.lastUpdated = Date.now();

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating hospital capacity',
    });
  }
});

router.post('/nearby', async (req, res) => {
  try {
    const {
      longitude,
      latitude,
      emergencyType,
      maxDistance,
    } = req.body;

    if (!Number.isFinite(Number(longitude)) || !Number.isFinite(Number(latitude)) || !emergencyType) {
      return res.status(400).json({
        success: false,
        message: 'Longitude, latitude and emergency type are required',
      });
    }

    const numLng = Number(longitude);
    const numLat = Number(latitude);

    const targetType = (emergencyType === 'other' || emergencyType === 'general')
      ? { $in: ['general', 'other'] }
      : emergencyType;

    let hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [numLng, numLat],
          },
          $maxDistance: maxDistance || 30000,
        },
      },
      emergencyDeptOpen: true,
      emergencyTypes: targetType,
    });

    // 2. If no local records exist in DB within 30km (e.g. user GPS in another city),
    // dynamically fetch real local hospitals from OpenStreetMap around user coordinates!
    if (!hospitals || hospitals.length === 0) {
      console.log(`No local DB hospitals within 30km of (${numLat}, ${numLng}). Fetching live from OpenStreetMap...`);
      const osmHospitals = await fetchNearbyHospitalsFromOSM(numLat, numLng, emergencyType);
      if (osmHospitals && osmHospitals.length > 0) {
        hospitals = osmHospitals;
      }
    }

    // 3. Fallback: If OSM returns nothing (e.g. offline/network issue), find nearest DB records without distance cutoff
    if (!hospitals || hospitals.length === 0) {
      hospitals = await Hospital.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [numLng, numLat],
            },
          },
        },
        emergencyDeptOpen: true,
        emergencyTypes: targetType,
      }).limit(10);
    }

    // Safety fallback: if no emergencyDeptOpen match, find nearest by emergency type
    if (!hospitals || hospitals.length === 0) {
      hospitals = await Hospital.find({
        emergencyTypes: targetType,
      }).limit(10);
    }

    // Ultimate fallback for demo data: return any available hospitals
    if (!hospitals || hospitals.length === 0) {
      hospitals = await Hospital.find({}).limit(10);
    }

    const hospitalsWithDistance = hospitals.map((hospital) => {
      const distanceMeters = haversineMeters(
        numLat, numLng, hospital.location.coordinates
      );
      return {
        ...hospital.toObject(),
        distanceMeters,
        straightLineDistanceKm: Number((distanceMeters / 1000).toFixed(2)),
      };
    });

    const { ranked, recommendation } = await getMLScores(
      hospitalsWithDistance,
      emergencyType
    );

    res.status(200).json({
      success: true,
      count: ranked.length,
      recommendation,
      data: ranked,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Server error while finding nearby hospitals',
    });
  }
});

module.exports = router;
