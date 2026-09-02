const Hospital = require("../models/Hospital");
const { dispatchSchema } = require("./validationSchemas");

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

async function triggerEmergencyDispatch(args, io, sessionId = null) {
  const validated = dispatchSchema.parse(args);

  // Find hospitals with available beds using Mongoose directly
  const hospitals = await Hospital.find({
    emergencyWardOpen: true,
    beds: { $gt: 0 },
  });

  let nearestHospital = null;
  let minDistance = Infinity;

  for (const hospital of hospitals) {
    if (!hospital.location || !hospital.location.coordinates) continue;
    const [lng, lat] = hospital.location.coordinates;
    const dist = haversineDistance(
      validated.user_location.latitude,
      validated.user_location.longitude,
      lat,
      lng
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestHospital = hospital;
    }
  }

  // Emit real-time dispatch event via Socket.io
  if (io) {
    io.emit("dispatch:new", {
      dispatchId: sessionId || "unknown",
      severity: validated.severity_level,
      hospital: nearestHospital
        ? {
            name: nearestHospital.name,
            latitude: nearestHospital.location.coordinates[1],
            longitude: nearestHospital.location.coordinates[0],
            distanceKm: minDistance.toFixed(1),
          }
        : null,
      patient: {
        latitude: validated.user_location.latitude,
        longitude: validated.user_location.longitude,
        condition: validated.patient_condition,
      },
      eta: `${Math.max(5, Math.round(minDistance * 2.5))} minutes`,
    });
  }

  return {
    success: true,
    dispatch_id: sessionId,
    hospital_assigned: nearestHospital?.name || "Searching for nearest available hospital",
    estimated_distance_km: minDistance === Infinity ? "Unknown" : `${minDistance.toFixed(1)} km`,
    estimated_arrival: `${Math.max(5, Math.round(minDistance * 2.5))} minutes`,
    message: `Ambulance dispatched from ${nearestHospital?.name || "nearest available unit"}. ETA: ~${Math.max(5, Math.round(minDistance * 2.5))} minutes. Stay on the line.`,
  };
}

module.exports = { triggerEmergencyDispatch };
