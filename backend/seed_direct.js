const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Hospital = require('./models/Hospital');

let replicaSet = 'atlas-v3xde0-shard-0';
try {
    const nslookupOut = execSync('nslookup -type=TXT medireach.msxfhwl.mongodb.net').toString();
    const txtMatch = nslookupOut.match(/authSource=admin&replicaSet=([^&\s\"']+)/);
    if (txtMatch) replicaSet = txtMatch[1];
} catch(e) {}

const uri = 'mongodb://nitinbalaji285_db_user:CQgGVwaWilgKOmOp@ac-v3xde0e-shard-00-00.msxfhwl.mongodb.net:27017,ac-v3xde0e-shard-00-01.msxfhwl.mongodb.net:27017,ac-v3xde0e-shard-00-02.msxfhwl.mongodb.net:27017/medireach?ssl=true&replicaSet=' + replicaSet + '&authSource=admin&retryWrites=true&w=majority&appName=Medireach';

const seedData = async () => {
    try {
        console.log('Connecting with URI:', uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB directly (non-SRV)');

        const fallbackPath = path.join(__dirname, 'hospitals_fallback.json');
        const rawData = fs.readFileSync(fallbackPath, 'utf8');
        const hospitals = JSON.parse(rawData);

        await Hospital.deleteMany({});
        console.log('Deleted old dummy hospitals');

        const formattedHospitals = hospitals.map(h => ({
            name: h.name,
            address: h.address || 'Delhi, India',
            area: 'Delhi',
            location: {
                type: 'Point',
                coordinates: [h.longitude, h.latitude]
            },
            contact: h.phone || '102',
            beds: h.availableBeds || h.totalBeds || Math.floor(Math.random() * 200) + 50,
            icuBeds: Math.floor(Math.random() * 20) + 5,
            oxygen: Math.floor(Math.random() * 100) + 20,
            emergencyWardOpen: true,
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1)
        }));

        await Hospital.insertMany(formattedHospitals);
        console.log('Successfully seeded ' + formattedHospitals.length + ' real hospitals to MongoDB Atlas!');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
