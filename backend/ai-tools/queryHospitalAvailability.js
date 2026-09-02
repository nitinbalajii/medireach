const Hospital = require("../models/Hospital");
const { hospitalQuerySchema } = require("./validationSchemas");

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function queryHospitalAvailability(args) {
  const validated = hospitalQuerySchema.parse(args);

  const hospitals = await Hospital.find({
    emergencyWardOpen: true,
    beds: { $gt: 0 },
  });

  const nearbyHospitals = hospitals
    .filter((h) => h.location && h.location.coordinates)
    .map((h) => {
      const [lng, lat] = h.location.coordinates;
      return {
        id: h._id.toString(),
        name: h.name,
        address: h.address,
        contact: h.contact,
        distanceKm: haversineDistance(validated.latitude, validated.longitude, lat, lng),
        beds: h.beds,
        icuBeds: h.icuBeds,
        specialists: h.specialists,
      };
    })
    .filter((h) => h.distanceKm <= validated.search_radius_km)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (nearbyHospitals.length === 0) {
    return {
      success: false,
      message: `No hospitals with available facilities found within ${validated.search_radius_km} km.`,
      hospitals: [],
    };
  }

  return {
    success: true,
    total_found: nearbyHospitals.length,
    recommended: nearbyHospitals[0].name,
    hospitals: nearbyHospitals.slice(0, 3).map((h) => ({
      name: h.name,
      distance: `${h.distanceKm.toFixed(1)} km`,
      available_beds: h.beds,
      phone: h.contact,
    })),
  };
}

module.exports = { queryHospitalAvailability };
