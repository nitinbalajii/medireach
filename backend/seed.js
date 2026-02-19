const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('./models/Hospital');
const Ambulance = require('./models/Ambulance');
const Doctor = require('./models/Doctor');
const Pharmacy = require('./models/Pharmacy');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// Sample hospitals data (Delhi)
const hospitals = [
    {
        name: "AIIMS Delhi",
        address: "Ansari Nagar, New Delhi",
        area: "South Delhi",
        location: { type: "Point", coordinates: [77.2090, 28.5672] },
        contact: "011-26588500",
        beds: 35,
        icuBeds: 12,
        oxygen: 85,
        ventilators: 8,
        pediatricBeds: 10,
        traumaBeds: 15,
        emergencyWardOpen: true,
        rating: 4.8,
        specialists: ["Cardiology", "Neurology", "Trauma", "Pediatrics"]
    },
    {
        name: "Safdarjung Hospital",
        address: "Ansari Nagar West, New Delhi",
        area: "South Delhi",
        location: { type: "Point", coordinates: [77.1925, 28.5672] },
        contact: "011-26165060",
        beds: 28,
        icuBeds: 10,
        oxygen: 70,
        ventilators: 6,
        pediatricBeds: 8,
        traumaBeds: 12,
        emergencyWardOpen: true,
        rating: 4.5,
        specialists: ["General Medicine", "Surgery", "Orthopedics"]
    },
    {
        name: "Max Super Speciality Hospital, Saket",
        address: "Saket, New Delhi",
        area: "South Delhi",
        location: { type: "Point", coordinates: [77.2167, 28.5244] },
        contact: "011-26515050",
        beds: 42,
        icuBeds: 18,
        oxygen: 95,
        ventilators: 12,
        pediatricBeds: 15,
        traumaBeds: 10,
        emergencyWardOpen: true,
        rating: 4.7,
        specialists: ["Cardiology", "Neurology", "Oncology", "Pediatrics"]
    },
    {
        name: "Fortis Hospital, Vasant Kunj",
        address: "Sector B, Vasant Kunj, New Delhi",
        area: "South Delhi",
        location: { type: "Point", coordinates: [77.1594, 28.5167] },
        contact: "011-42776222",
        beds: 38,
        icuBeds: 15,
        oxygen: 88,
        ventilators: 10,
        pediatricBeds: 12,
        traumaBeds: 8,
        emergencyWardOpen: true,
        rating: 4.6,
        specialists: ["Cardiology", "Orthopedics", "Neurology"]
    },
    {
        name: "Apollo Hospital, Sarita Vihar",
        address: "Mathura Road, Sarita Vihar, New Delhi",
        area: "South Delhi",
        location: { type: "Point", coordinates: [77.2933, 28.5333] },
        contact: "011-26825858",
        beds: 40,
        icuBeds: 16,
        oxygen: 90,
        ventilators: 11,
        pediatricBeds: 14,
        traumaBeds: 9,
        emergencyWardOpen: true,
        rating: 4.7,
        specialists: ["Cardiology", "Neurosurgery", "Oncology", "Pediatrics"]
    }
];

// Sample ambulances data
const ambulances = [
    {
        vehicleNumber: "DL-1C-1234",
        type: "Advanced",
        status: "available",
        currentLocation: { type: "Point", coordinates: [77.2090, 28.6139] },
        driver: { name: "Rajesh Kumar", phone: "+91-9876543210" }
    },
    {
        vehicleNumber: "DL-1C-5678",
        type: "Basic",
        status: "available",
        currentLocation: { type: "Point", coordinates: [77.1925, 28.5672] },
        driver: { name: "Amit Singh", phone: "+91-9876543211" }
    },
    {
        vehicleNumber: "DL-1C-9012",
        type: "Cardiac",
        status: "available",
        currentLocation: { type: "Point", coordinates: [77.2167, 28.5244] },
        driver: { name: "Suresh Sharma", phone: "+91-9876543212" }
    },
    {
        vehicleNumber: "DL-1C-3456",
        type: "Advanced",
        status: "available",
        currentLocation: { type: "Point", coordinates: [77.1594, 28.5167] },
        driver: { name: "Vikram Patel", phone: "+91-9876543213" }
    }
];

// Pharmacies data
const pharmacies = [
    {
        name: "Apollo Pharmacy - Connaught Place",
        address: "Connaught Place, New Delhi",
        location: { type: "Point", coordinates: [77.2167, 28.6315] },
        phone: "+91-11-4321-1111",
        is24x7: true,
        type: "private",
        inventory: [
            { medicineId: 1, medicineName: "Paracetamol 500mg", availability: "in_stock", price: 25 },
            { medicineId: 2, medicineName: "Aspirin 75mg", availability: "in_stock", price: 45 },
            { medicineId: 3, medicineName: "Amoxicillin 500mg", availability: "low_stock", price: 120 }
        ]
    },
    {
        name: "MedPlus - Saket",
        address: "Saket, New Delhi",
        location: { type: "Point", coordinates: [77.2066, 28.5244] },
        phone: "+91-11-4321-2222",
        is24x7: false,
        type: "private",
        inventory: [
            { medicineId: 1, medicineName: "Paracetamol 500mg", availability: "in_stock", price: 22 },
            { medicineId: 4, medicineName: "Insulin (Vial)", availability: "in_stock", price: 850 }
        ]
    },
    {
        name: "Jan Aushadhi Kendra - Nehru Place",
        address: "Nehru Place, New Delhi",
        location: { type: "Point", coordinates: [77.2501, 28.5494] },
        phone: "+91-11-4321-3333",
        is24x7: false,
        type: "government",
        inventory: [
            { medicineId: 1, medicineName: "Paracetamol 500mg", availability: "in_stock", price: 10 },
            { medicineId: 2, medicineName: "Aspirin 75mg", availability: "in_stock", price: 15 }
        ]
    }
];

// Seed database
const seedDatabase = async () => {
    try {
        // Clear existing data
        await Hospital.deleteMany({});
        await Ambulance.deleteMany({});
        await Doctor.deleteMany({});
        await Pharmacy.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert hospitals
        const createdHospitals = await Hospital.insertMany(hospitals);
        console.log(`✅ Inserted ${createdHospitals.length} hospitals`);

        // Insert ambulances
        const createdAmbulances = await Ambulance.insertMany(ambulances);
        console.log(`✅ Inserted ${createdAmbulances.length} ambulances`);

        // Insert pharmacies
        const createdPharmacies = await Pharmacy.insertMany(pharmacies);
        console.log(`✅ Inserted ${createdPharmacies.length} pharmacies`);

        // Create doctors linked to hospitals
        const doctors = [
            {
                name: "Dr. Amit Sharma",
                specialty: "Cardiology",
                qualifications: ["MBBS", "MD (Cardiology)", "DM"],
                experience: 15,
                hospitalId: createdHospitals[0]._id,
                hospitalName: "AIIMS Delhi",
                rating: 4.8,
                schedule: [
                    { day: "monday", startTime: "09:00", endTime: "17:00", isOnDuty: true },
                    { day: "wednesday", startTime: "09:00", endTime: "17:00", isOnDuty: true },
                    { day: "friday", startTime: "09:00", endTime: "17:00", isOnDuty: true }
                ],
                availableForTeleconsult: true,
                consultationFee: 1500,
                phone: "011-26588500",
                email: "amit.sharma@aiims.edu"
            },
            {
                name: "Dr. Priya Mehta",
                specialty: "Pediatrics",
                qualifications: ["MBBS", "MD (Pediatrics)", "Fellowship (Neonatology)"],
                experience: 12,
                hospitalId: createdHospitals[1]._id,
                hospitalName: "Safdarjung Hospital",
                rating: 4.6,
                schedule: [
                    { day: "monday", startTime: "10:00", endTime: "18:00", isOnDuty: true },
                    { day: "wednesday", startTime: "10:00", endTime: "18:00", isOnDuty: true },
                    { day: "saturday", startTime: "10:00", endTime: "14:00", isOnDuty: true }
                ],
                availableForTeleconsult: true,
                consultationFee: 1200,
                phone: "011-26165060",
                email: "priya.mehta@safdarjung.gov.in"
            },
            {
                name: "Dr. Rajesh Kumar",
                specialty: "Neurology",
                qualifications: ["MBBS", "MD (Medicine)", "DM (Neurology)"],
                experience: 18,
                hospitalId: createdHospitals[2]._id,
                hospitalName: "Max Super Speciality Hospital, Saket",
                rating: 4.9,
                schedule: [
                    { day: "tuesday", startTime: "08:00", endTime: "16:00", isOnDuty: true },
                    { day: "wednesday", startTime: "08:00", endTime: "16:00", isOnDuty: true },
                    { day: "thursday", startTime: "08:00", endTime: "16:00", isOnDuty: true }
                ],
                availableForTeleconsult: false,
                consultationFee: 2000,
                phone: "011-26515050",
                email: "rajesh.kumar@maxhealthcare.in"
            },
            {
                name: "Dr. Sunita Rao",
                specialty: "Orthopedics",
                qualifications: ["MBBS", "MS (Orthopedics)", "Fellowship (Joint Replacement)"],
                experience: 20,
                hospitalId: createdHospitals[3]._id,
                hospitalName: "Fortis Hospital, Vasant Kunj",
                rating: 4.7,
                schedule: [
                    { day: "monday", startTime: "09:00", endTime: "17:00", isOnDuty: true },
                    { day: "wednesday", startTime: "09:00", endTime: "17:00", isOnDuty: true },
                    { day: "friday", startTime: "09:00", endTime: "13:00", isOnDuty: true }
                ],
                availableForTeleconsult: true,
                consultationFee: 1800,
                phone: "011-42776222",
                email: "sunita.rao@fortishealthcare.com"
            },
            {
                name: "Dr. Vikram Nair",
                specialty: "Emergency Medicine",
                qualifications: ["MBBS", "MD (Emergency Medicine)", "ATLS Certified"],
                experience: 10,
                hospitalId: createdHospitals[0]._id,
                hospitalName: "AIIMS Delhi",
                rating: 4.5,
                schedule: [
                    { day: "monday", startTime: "00:00", endTime: "23:59", isOnDuty: true },
                    { day: "tuesday", startTime: "00:00", endTime: "23:59", isOnDuty: true },
                    { day: "wednesday", startTime: "00:00", endTime: "23:59", isOnDuty: true },
                    { day: "thursday", startTime: "00:00", endTime: "23:59", isOnDuty: true },
                    { day: "friday", startTime: "00:00", endTime: "23:59", isOnDuty: true },
                    { day: "saturday", startTime: "00:00", endTime: "23:59", isOnDuty: true },
                    { day: "sunday", startTime: "00:00", endTime: "23:59", isOnDuty: true }
                ],
                availableForTeleconsult: false,
                consultationFee: 0,
                phone: "011-26588700",
                email: "emergency@aiims.edu"
            },
            {
                name: "Dr. Meera Joshi",
                specialty: "Oncology",
                qualifications: ["MBBS", "MD (Medicine)", "DM (Medical Oncology)"],
                experience: 14,
                hospitalId: createdHospitals[4]._id,
                hospitalName: "Apollo Hospital, Sarita Vihar",
                rating: 4.8,
                schedule: [
                    { day: "tuesday", startTime: "09:00", endTime: "17:00", isOnDuty: true },
                    { day: "wednesday", startTime: "09:00", endTime: "17:00", isOnDuty: true },
                    { day: "friday", startTime: "09:00", endTime: "17:00", isOnDuty: true }
                ],
                availableForTeleconsult: true,
                consultationFee: 2500,
                phone: "011-26825858",
                email: "meera.joshi@apollohospitals.com"
            }
        ];

        const createdDoctors = await Doctor.insertMany(doctors);
        console.log(`✅ Inserted ${createdDoctors.length} doctors`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nSummary:');
        console.log(`  - ${createdHospitals.length} hospitals`);
        console.log(`  - ${createdAmbulances.length} ambulances`);
        console.log(`  - ${createdDoctors.length} doctors`);
        console.log(`  - ${createdPharmacies.length} pharmacies`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();

