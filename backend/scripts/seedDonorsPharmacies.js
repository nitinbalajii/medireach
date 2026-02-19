require('dotenv').config();
const mongoose = require('mongoose');
const Donor = require('../models/Donor');
const Pharmacy = require('../models/Pharmacy');

const donors = [
    { name: 'Rahul Sharma', bloodGroup: 'O+', phone: '+91-9876501001', email: 'rahul.s@gmail.com', area: 'South Delhi', available: true, totalDonations: 12, verified: true, lastDonation: new Date('2025-12-01'), location: { type: 'Point', coordinates: [77.2090, 28.5355] } },
    { name: 'Priya Mehta', bloodGroup: 'A+', phone: '+91-9876501002', email: 'priya.m@gmail.com', area: 'North Delhi', available: true, totalDonations: 8, verified: true, lastDonation: new Date('2025-11-15'), location: { type: 'Point', coordinates: [77.2300, 28.7041] } },
    { name: 'Amit Kumar', bloodGroup: 'B+', phone: '+91-9876501003', email: 'amit.k@gmail.com', area: 'West Delhi', available: false, totalDonations: 15, verified: true, lastDonation: new Date('2026-01-10'), location: { type: 'Point', coordinates: [77.1025, 28.6519] } },
    { name: 'Sneha Gupta', bloodGroup: 'AB-', phone: '+91-9876501004', email: 'sneha.g@gmail.com', area: 'East Delhi', available: true, totalDonations: 20, verified: true, lastDonation: new Date('2025-10-20'), location: { type: 'Point', coordinates: [77.3010, 28.6280] } },
    { name: 'Vikram Singh', bloodGroup: 'O-', phone: '+91-9876501005', email: 'vikram.s@gmail.com', area: 'Central Delhi', available: true, totalDonations: 10, verified: true, lastDonation: new Date('2026-01-05'), location: { type: 'Point', coordinates: [77.2090, 28.6448] } },
    { name: 'Anjali Verma', bloodGroup: 'B-', phone: '+91-9876501006', email: 'anjali.v@gmail.com', area: 'South Delhi', available: true, totalDonations: 18, verified: true, lastDonation: new Date('2026-01-20'), location: { type: 'Point', coordinates: [77.2167, 28.5244] } },
    { name: 'Rohit Jain', bloodGroup: 'A-', phone: '+91-9876501007', email: 'rohit.j@gmail.com', area: 'North Delhi', available: true, totalDonations: 6, verified: true, lastDonation: new Date('2025-09-30'), location: { type: 'Point', coordinates: [77.2100, 28.7200] } },
    { name: 'Kavita Patel', bloodGroup: 'AB+', phone: '+91-9876501008', email: 'kavita.p@gmail.com', area: 'West Delhi', available: false, totalDonations: 4, verified: true, lastDonation: new Date('2026-02-01'), location: { type: 'Point', coordinates: [77.0800, 28.6300] } },
    { name: 'Suresh Nair', bloodGroup: 'O+', phone: '+91-9876501009', email: 'suresh.n@gmail.com', area: 'South Delhi', available: true, totalDonations: 22, verified: true, lastDonation: new Date('2025-12-15'), location: { type: 'Point', coordinates: [77.2050, 28.5500] } },
    { name: 'Deepa Reddy', bloodGroup: 'A+', phone: '+91-9876501010', email: 'deepa.r@gmail.com', area: 'East Delhi', available: true, totalDonations: 9, verified: true, lastDonation: new Date('2025-11-01'), location: { type: 'Point', coordinates: [77.3200, 28.6100] } },
];

const pharmacies = [
    {
        name: 'Apollo Pharmacy — Connaught Place',
        address: 'Block A, Connaught Place, New Delhi',
        area: 'Central Delhi',
        phone: '011-26341234',
        is24x7: true,
        type: 'private',
        location: { type: 'Point', coordinates: [77.2177, 28.6304] },
        inventory: [
            { medicineName: 'Paracetamol', availability: 'in_stock', price: 25 },
            { medicineName: 'Aspirin', availability: 'in_stock', price: 30 },
            { medicineName: 'Amoxicillin', availability: 'in_stock', price: 120 },
            { medicineName: 'Metformin', availability: 'low_stock', price: 85 },
            { medicineName: 'Insulin', availability: 'in_stock', price: 450 },
            { medicineName: 'Ibuprofen', availability: 'in_stock', price: 40 },
            { medicineName: 'Omeprazole', availability: 'in_stock', price: 60 },
        ]
    },
    {
        name: 'MedPlus — Saket',
        address: 'Select City Walk, Saket, New Delhi',
        area: 'South Delhi',
        phone: '011-26515678',
        is24x7: false,
        type: 'private',
        location: { type: 'Point', coordinates: [77.2167, 28.5244] },
        inventory: [
            { medicineName: 'Paracetamol', availability: 'in_stock', price: 22 },
            { medicineName: 'Ibuprofen', availability: 'in_stock', price: 38 },
            { medicineName: 'Cough Syrup', availability: 'in_stock', price: 95 },
            { medicineName: 'Vitamin D', availability: 'in_stock', price: 180 },
            { medicineName: 'Cetirizine', availability: 'in_stock', price: 35 },
            { medicineName: 'Azithromycin', availability: 'low_stock', price: 140 },
        ]
    },
    {
        name: 'Wellness Forever — Vasant Kunj',
        address: 'DLF Promenade Mall, Vasant Kunj, New Delhi',
        area: 'South Delhi',
        phone: '011-42779999',
        is24x7: true,
        type: 'private',
        location: { type: 'Point', coordinates: [77.1594, 28.5167] },
        inventory: [
            { medicineName: 'Aspirin', availability: 'in_stock', price: 28 },
            { medicineName: 'Insulin', availability: 'in_stock', price: 440 },
            { medicineName: 'Blood Pressure Tablets', availability: 'in_stock', price: 95 },
            { medicineName: 'Antibiotics', availability: 'in_stock', price: 130 },
            { medicineName: 'Metformin', availability: 'in_stock', price: 80 },
            { medicineName: 'Vitamin C', availability: 'in_stock', price: 65 },
        ]
    },
    {
        name: 'Jan Aushadhi — Rohini',
        address: 'Sector 7, Rohini, New Delhi',
        area: 'North Delhi',
        phone: '011-27051234',
        is24x7: false,
        type: 'government',
        location: { type: 'Point', coordinates: [77.1200, 28.7400] },
        inventory: [
            { medicineName: 'Paracetamol', availability: 'in_stock', price: 10 },
            { medicineName: 'Metformin', availability: 'in_stock', price: 30 },
            { medicineName: 'Amoxicillin', availability: 'in_stock', price: 45 },
            { medicineName: 'Omeprazole', availability: 'in_stock', price: 20 },
            { medicineName: 'Atorvastatin', availability: 'in_stock', price: 25 },
            { medicineName: 'Amlodipine', availability: 'in_stock', price: 18 },
        ]
    },
    {
        name: 'Fortis Pharmacy — Shalimar Bagh',
        address: 'Fortis Hospital, Shalimar Bagh, New Delhi',
        area: 'North Delhi',
        phone: '011-45296666',
        is24x7: true,
        type: 'private',
        location: { type: 'Point', coordinates: [77.1600, 28.7200] },
        inventory: [
            { medicineName: 'Insulin', availability: 'in_stock', price: 460 },
            { medicineName: 'Ibuprofen', availability: 'in_stock', price: 42 },
            { medicineName: 'Azithromycin', availability: 'in_stock', price: 150 },
            { medicineName: 'Cough Syrup', availability: 'in_stock', price: 100 },
            { medicineName: 'Vitamin D', availability: 'low_stock', price: 190 },
            { medicineName: 'Paracetamol', availability: 'in_stock', price: 24 },
        ]
    },
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');

    // Clear existing
    await Donor.deleteMany({});
    await Pharmacy.deleteMany({});
    console.log('Cleared existing donors and pharmacies');

    // Seed
    await Donor.insertMany(donors);
    console.log(`✅ Seeded ${donors.length} donors`);

    await Pharmacy.insertMany(pharmacies);
    console.log(`✅ Seeded ${pharmacies.length} pharmacies`);

    process.exit(0);
}).catch(err => { console.error(err.message); process.exit(1); });
