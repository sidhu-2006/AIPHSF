const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('./models/Hospital');

dotenv.config();
// This is illustrative seed data for local demonstration only. Names, contacts,
// staffing, availability, and locations are not verified for real-world use.
const hospitals = [
  {
    name: 'Ruby Hall Clinic',
    address: '40 Sassoon Road, Pune, Maharashtra 411001',
    phone: '9823012345',
    location: {
      type: 'Point',
      coordinates: [73.8826, 18.5314]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'respiratory', 'general', 'other'],
    totalICUBeds: 20,
    availableICUBeds: 8,
    emergencyDeptOpen: true,
    currentLoad: 5,
    specialists: [
      { name: 'Dr. Sharma', type: 'cardiologist', available: true },
      { name: 'Dr. Patil', type: 'trauma surgeon', available: true },
      { name: 'Sample Pulmonologist', type: 'pulmonologist', available: true }
    ]
  },
  {
    name: 'Deenanath Mangeshkar Hospital',
    address: 'Erandwane, Pune, Maharashtra 411004',
    phone: '9823056789',
    location: {
      type: 'Point',
      coordinates: [73.8401, 18.5089]
    },
    emergencyTypes: ['cardiac', 'stroke', 'general', 'other'],
    totalICUBeds: 30,
    availableICUBeds: 3,
    emergencyDeptOpen: true,
    currentLoad: 9,
    specialists: [
      { name: 'Dr. Joshi', type: 'neurologist', available: true },
      { name: 'Dr. Kulkarni', type: 'cardiologist', available: false }
    ]
  },
  {
    name: 'KEM Hospital Pune',
    address: 'Rasta Peth, Pune, Maharashtra 411011',
    phone: '9823078901',
    location: {
      type: 'Point',
      coordinates: [73.8777, 18.5158]
    },
    emergencyTypes: ['trauma', 'burns', 'general', 'other'],
    totalICUBeds: 25,
    availableICUBeds: 12,
    emergencyDeptOpen: true,
    currentLoad: 3,
    specialists: [
      { name: 'Dr. Desai', type: 'trauma surgeon', available: true },
      { name: 'Dr. More', type: 'burn specialist', available: true }
    ]
  },
  {
    name: 'Sassoon General Hospital',
    address: 'Pune Station Area, Pune, Maharashtra 411001',
    phone: '9823090123',
    location: {
      type: 'Point',
      coordinates: [73.8764, 18.5236]
    },
    emergencyTypes: ['cardiac', 'trauma', 'burns', 'stroke', 'respiratory', 'general', 'other'],
    totalICUBeds: 50,
    availableICUBeds: 15,
    emergencyDeptOpen: true,
    currentLoad: 6,
    specialists: [
      { name: 'Dr. Bhosale', type: 'cardiologist', available: true },
      { name: 'Dr. Jadhav', type: 'trauma surgeon', available: false },
      { name: 'Dr. Wagh', type: 'neurologist', available: true },
      { name: 'Sample Pulmonologist', type: 'pulmonologist', available: true }
    ]
  },
  {
    name: 'Jehangir Hospital',
    address: '32 Sassoon Road, Pune, Maharashtra 411001',
    phone: '9823034567',
    location: {
      type: 'Point',
      coordinates: [73.8831, 18.5298]
    },
    emergencyTypes: ['cardiac', 'stroke', 'general', 'other'],
    totalICUBeds: 15,
    availableICUBeds: 0,
    emergencyDeptOpen: false,
    currentLoad: 10,
    specialists: [
      { name: 'Dr. Irani', type: 'cardiologist', available: false }
    ]
  },
  {
    name: 'Sahyadri Hospital Kothrud',
    address: 'Karve Road, Kothrud, Pune, Maharashtra 411038',
    phone: '9823101001',
    location: {
      type: 'Point',
      coordinates: [73.807, 18.5074]
    },
    emergencyTypes: ['cardiac', 'stroke', 'general', 'other'],
    totalICUBeds: 25,
    availableICUBeds: 10,
    emergencyDeptOpen: true,
    currentLoad: 3,
    specialists: [
      { name: 'Dr. Kelkar', type: 'cardiologist', available: true },
      { name: 'Dr. Phadke', type: 'neurologist', available: true }
    ]
  },
  {
    name: 'Noble Hospital Hadapsar',
    address: 'Magarpatta Road, Hadapsar, Pune, Maharashtra 411028',
    phone: '9823101002',
    location: {
      type: 'Point',
      coordinates: [73.931, 18.5065]
    },
    emergencyTypes: ['trauma', 'burns', 'general', 'other'],
    totalICUBeds: 30,
    availableICUBeds: 7,
    emergencyDeptOpen: true,
    currentLoad: 6,
    specialists: [
      { name: 'Dr. Gaikwad', type: 'trauma surgeon', available: true },
      { name: 'Dr. Kamble', type: 'burn specialist', available: false }
    ]
  },
  {
    name: 'Aditya Birla Memorial Hospital',
    address: 'Chinchwad, Pune, Maharashtra 411033',
    phone: '9823101003',
    location: {
      type: 'Point',
      coordinates: [73.7635, 18.5985]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'general', 'other'],
    totalICUBeds: 40,
    availableICUBeds: 18,
    emergencyDeptOpen: true,
    currentLoad: 2,
    specialists: [
      { name: 'Dr. Mehra', type: 'cardiologist', available: true },
      { name: 'Dr. Rane', type: 'trauma surgeon', available: true },
      { name: 'Dr. Deshpande', type: 'neurologist', available: false }
    ]
  },
  {
    name: 'YCM Hospital Pimpri',
    address: 'Sant Tukaramnagar, Pimpri, Pune, Maharashtra 411018',
    phone: '9823101004',
    location: {
      type: 'Point',
      coordinates: [73.7987, 18.628]
    },
    emergencyTypes: ['trauma', 'burns', 'general', 'other'],
    totalICUBeds: 35,
    availableICUBeds: 2,
    emergencyDeptOpen: true,
    currentLoad: 9,
    specialists: [
      { name: 'Dr. Shinde', type: 'general', available: true },
      { name: 'Dr. Pawar', type: 'trauma surgeon', available: false }
    ]
  },
  {
    name: 'Lokmanya Hospital Chinchwad',
    address: 'Chinchwad Station Road, Chinchwad, Pune, Maharashtra 411019',
    phone: '9823101005',
    location: {
      type: 'Point',
      coordinates: [73.787, 18.647]
    },
    emergencyTypes: ['cardiac', 'trauma', 'general', 'other'],
    totalICUBeds: 20,
    availableICUBeds: 0,
    emergencyDeptOpen: false,
    currentLoad: 10,
    specialists: [
      { name: 'Dr. Nikam', type: 'cardiologist', available: false }
    ]
  },
  {
    name: 'Jupiter Hospital Baner',
    address: 'Baner Road, Baner, Pune, Maharashtra 411045',
    phone: '9823101006',
    location: {
      type: 'Point',
      coordinates: [73.785, 18.56]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'general', 'other'],
    totalICUBeds: 35,
    availableICUBeds: 12,
    emergencyDeptOpen: true,
    currentLoad: 5,
    specialists: [
      { name: 'Dr. Gokhale', type: 'cardiologist', available: true },
      { name: 'Dr. Kapoor', type: 'neurologist', available: true },
      { name: 'Dr. Sawant', type: 'trauma surgeon', available: true }
    ]
  },
  {
    name: 'Aundh District Hospital',
    address: 'Aundh-Baner Link Road, Aundh, Pune, Maharashtra 411007',
    phone: '9823101007',
    location: {
      type: 'Point',
      coordinates: [73.807, 18.559]
    },
    emergencyTypes: ['stroke', 'trauma', 'general', 'other'],
    totalICUBeds: 28,
    availableICUBeds: 14,
    emergencyDeptOpen: true,
    currentLoad: 2,
    specialists: [
      { name: 'Dr. Sathe', type: 'neurologist', available: true },
      { name: 'Dr. Mane', type: 'general', available: true }
    ]
  },
  {
    name: 'Inlaks & Budhrani Hospital',
    address: 'Kohinoor Chowk, Shivajinagar, Pune, Maharashtra 411005',
    phone: '9823101008',
    location: {
      type: 'Point',
      coordinates: [73.848, 18.532]
    },
    emergencyTypes: ['trauma', 'burns', 'general', 'other'],
    totalICUBeds: 18,
    availableICUBeds: 5,
    emergencyDeptOpen: true,
    currentLoad: 7,
    specialists: [
      { name: 'Dr. Bapat', type: 'burn specialist', available: true },
      { name: 'Dr. Thakur', type: 'trauma surgeon', available: true }
    ]
  },
  {
    name: 'Poona Hospital Deccan',
    address: '27 Sadashiv Peth, Deccan Gymkhana, Pune, Maharashtra 411030',
    phone: '9823101009',
    location: {
      type: 'Point',
      coordinates: [73.844, 18.517]
    },
    emergencyTypes: ['cardiac', 'general', 'other'],
    totalICUBeds: 15,
    availableICUBeds: 1,
    emergencyDeptOpen: true,
    currentLoad: 8,
    specialists: [
      { name: 'Dr. Lele', type: 'cardiologist', available: true }
    ]
  },
  {
    name: 'Bharati Hospital Swargate',
    address: 'Pune-Satara Road, Swargate, Pune, Maharashtra 411009',
    phone: '9823101010',
    location: {
      type: 'Point',
      coordinates: [73.857, 18.498]
    },
    emergencyTypes: ['cardiac', 'trauma', 'burns', 'stroke', 'respiratory', 'general', 'other'],
    totalICUBeds: 45,
    availableICUBeds: 20,
    emergencyDeptOpen: true,
    currentLoad: 4,
    specialists: [
      { name: 'Dr. Chavan', type: 'cardiologist', available: true },
      { name: 'Dr. Kale', type: 'trauma surgeon', available: true },
      { name: 'Dr. Raut', type: 'neurologist', available: false },
      { name: 'Dr. Sonawane', type: 'burn specialist', available: true },
      { name: 'Sample Pulmonologist', type: 'pulmonologist', available: true }
    ]
  },
  {
    name: 'Sahakarnagar Multispecialty Hospital',
    address: 'Sahakarnagar No.2, Pune, Maharashtra 411009',
    phone: '9823101011',
    location: {
      type: 'Point',
      coordinates: [73.863, 18.485]
    },
    emergencyTypes: ['stroke', 'general', 'other'],
    totalICUBeds: 12,
    availableICUBeds: 6,
    emergencyDeptOpen: true,
    currentLoad: 3,
    specialists: [
      { name: 'Dr. Dange', type: 'neurologist', available: true },
      { name: 'Dr. Londhe', type: 'general', available: true }
    ]
  },
  {
    name: 'Bibwewadi Community Hospital',
    address: 'Bibwewadi Road, Bibwewadi, Pune, Maharashtra 411037',
    phone: '9823101012',
    location: {
      type: 'Point',
      coordinates: [73.866, 18.478]
    },
    emergencyTypes: ['trauma', 'general', 'other'],
    totalICUBeds: 10,
    availableICUBeds: 0,
    emergencyDeptOpen: true,
    currentLoad: 7,
    specialists: [
      { name: 'Dr. Salve', type: 'general', available: true }
    ]
  },
  {
    name: 'Columbia Asia Hospital Kondhwa',
    address: 'NIBM Road, Kondhwa, Pune, Maharashtra 411048',
    phone: '9823101013',
    location: {
      type: 'Point',
      coordinates: [73.887, 18.476]
    },
    emergencyTypes: ['trauma', 'burns', 'general', 'other'],
    totalICUBeds: 22,
    availableICUBeds: 9,
    emergencyDeptOpen: true,
    currentLoad: 5,
    specialists: [
      { name: 'Dr. Naik', type: 'trauma surgeon', available: true },
      { name: 'Dr. Gupta', type: 'burn specialist', available: true }
    ]
  },
  {
    name: 'Inamdar Multispecialty Hospital',
    address: 'Fatima Nagar, Wanowrie, Pune, Maharashtra 411040',
    phone: '9823101014',
    location: {
      type: 'Point',
      coordinates: [73.895, 18.493]
    },
    emergencyTypes: ['cardiac', 'stroke', 'general', 'other'],
    totalICUBeds: 20,
    availableICUBeds: 3,
    emergencyDeptOpen: true,
    currentLoad: 8,
    specialists: [
      { name: 'Dr. Suryawanshi', type: 'cardiologist', available: true },
      { name: 'Dr. Giri', type: 'neurologist', available: false }
    ]
  },
  {
    name: 'Oyster & Pearl Hospital',
    address: 'North Main Road, Koregaon Park, Pune, Maharashtra 411001',
    phone: '9823101015',
    location: {
      type: 'Point',
      coordinates: [73.894, 18.536]
    },
    emergencyTypes: ['cardiac', 'stroke', 'general', 'other'],
    totalICUBeds: 18,
    availableICUBeds: 8,
    emergencyDeptOpen: true,
    currentLoad: 2,
    specialists: [
      { name: 'Dr. Khare', type: 'neurologist', available: true },
      { name: 'Dr. Sane', type: 'cardiologist', available: true }
    ]
  },
  {
    name: 'Columbia Asia Hospital Viman Nagar',
    address: 'Viman Nagar Road, Viman Nagar, Pune, Maharashtra 411014',
    phone: '9823101016',
    location: {
      type: 'Point',
      coordinates: [73.914, 18.567]
    },
    emergencyTypes: ['cardiac', 'trauma', 'general', 'other'],
    totalICUBeds: 24,
    availableICUBeds: 11,
    emergencyDeptOpen: false,
    currentLoad: 4,
    specialists: [
      { name: 'Dr. Agarwal', type: 'cardiologist', available: true },
      { name: 'Dr. Verma', type: 'trauma surgeon', available: true }
    ]
  },
  {
    name: 'Medicover Hospital Kharadi',
    address: 'Kharadi Bypass Road, Kharadi, Pune, Maharashtra 411014',
    phone: '9823101017',
    location: {
      type: 'Point',
      coordinates: [73.94, 18.553]
    },
    emergencyTypes: ['trauma', 'general', 'other'],
    totalICUBeds: 20,
    availableICUBeds: 10,
    emergencyDeptOpen: true,
    currentLoad: 1,
    specialists: [
      { name: 'Dr. Ingale', type: 'trauma surgeon', available: true },
      { name: 'Dr. Shirke', type: 'general', available: true }
    ]
  },
  {
    name: 'Symbiosis Hospital Yerawada',
    address: 'Symbiosis Road, Yerawada, Pune, Maharashtra 411006',
    phone: '9823101018',
    location: {
      type: 'Point',
      coordinates: [73.899, 18.556]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'general', 'other'],
    totalICUBeds: 30,
    availableICUBeds: 4,
    emergencyDeptOpen: true,
    currentLoad: 8,
    specialists: [
      { name: 'Dr. Jog', type: 'cardiologist', available: false },
      { name: 'Dr. Pandit', type: 'neurologist', available: true },
      { name: 'Dr. Mohite', type: 'trauma surgeon', available: true }
    ]
  },
  {
    name: 'Sinhagad Road Specialty Hospital',
    address: 'Sinhagad Road, Vadgaon Budruk, Pune, Maharashtra 411041',
    phone: '9823101019',
    location: {
      type: 'Point',
      coordinates: [73.82, 18.471]
    },
    emergencyTypes: ['burns', 'trauma', 'general', 'other'],
    totalICUBeds: 15,
    availableICUBeds: 6,
    emergencyDeptOpen: true,
    currentLoad: 5,
    specialists: [
      { name: 'Dr. Bhosle', type: 'burn specialist', available: true },
      { name: 'Dr. Thorat', type: 'general', available: true }
    ]
  },
  {
    name: 'Sahyadri Hospital Warje',
    address: 'Warje Malwadi Road, Warje, Pune, Maharashtra 411058',
    phone: '9823101020',
    location: {
      type: 'Point',
      coordinates: [73.81, 18.487]
    },
    emergencyTypes: ['cardiac', 'stroke', 'general', 'other'],
    totalICUBeds: 18,
    availableICUBeds: 0,
    emergencyDeptOpen: true,
    currentLoad: 3,
    specialists: [
      { name: 'Dr. Nene', type: 'cardiologist', available: true },
      { name: 'Dr. Potdar', type: 'neurologist', available: false }
    ]
  },
  {
    name: 'Command Hospital Pashan',
    address: 'Southern Command, Wanowrie, Pune, Maharashtra 411021',
    phone: '9823101021',
    location: {
      type: 'Point',
      coordinates: [73.796, 18.537]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'burns', 'general', 'other'],
    totalICUBeds: 50,
    availableICUBeds: 22,
    emergencyDeptOpen: true,
    currentLoad: 2,
    specialists: [
      { name: 'Dr. Col. Rao', type: 'cardiologist', available: true },
      { name: 'Dr. Col. Sen', type: 'neurologist', available: true },
      { name: 'Dr. Maj. Tiwari', type: 'trauma surgeon', available: true },
      { name: 'Dr. Maj. Das', type: 'burn specialist', available: true }
    ]
  },
  {
    name: 'Lifepoint Multispecialty Hinjawadi',
    address: 'Hinjawadi Phase 1, Hinjawadi, Pune, Maharashtra 411057',
    phone: '9823101022',
    location: {
      type: 'Point',
      coordinates: [73.736, 18.591]
    },
    emergencyTypes: ['trauma', 'general', 'other'],
    totalICUBeds: 16,
    availableICUBeds: 8,
    emergencyDeptOpen: true,
    currentLoad: 4,
    specialists: [
      { name: 'Dr. Deshpande', type: 'trauma surgeon', available: true },
      { name: 'Dr. Kulkarni', type: 'general', available: true }
    ]
  },
  {
    name: 'Gangadham Multispecialty Hospital',
    address: 'Market Yard Road, Gangadham, Pune, Maharashtra 411037',
    phone: '9823101023',
    location: {
      type: 'Point',
      coordinates: [73.859, 18.489]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'general', 'other'],
    totalICUBeds: 22,
    availableICUBeds: 5,
    emergencyDeptOpen: true,
    currentLoad: 9,
    specialists: [
      { name: 'Dr. Gawade', type: 'cardiologist', available: false },
      { name: 'Dr. Jagtap', type: 'trauma surgeon', available: true },
      { name: 'Dr. Khandekar', type: 'neurologist', available: true }
    ]
  },
  {
    name: 'Rao Nursing Home',
    address: 'Pune-Satara Road, Bibwewadi, Pune, Maharashtra 411037',
    phone: '9823101024',
    location: {
      type: 'Point',
      coordinates: [73.8605, 18.4795]
    },
    emergencyTypes: ['cardiac', 'general', 'other'],
    totalICUBeds: 16,
    availableICUBeds: 6,
    emergencyDeptOpen: true,
    currentLoad: 4,
    specialists: [
      { name: 'Dr. Rao', type: 'cardiologist', available: true },
      { name: 'Dr. Shah', type: 'general', available: true }
    ]
  },
  {
    name: 'Namoh Hospital',
    address: 'Mai Mangeshkar Hospital Chowk, Warje, Pune, Maharashtra 411058',
    phone: '9823101025',
    location: {
      type: 'Point',
      coordinates: [73.8045, 18.4862]
    },
    emergencyTypes: ['trauma', 'stroke', 'general', 'other'],
    totalICUBeds: 20,
    availableICUBeds: 9,
    emergencyDeptOpen: true,
    currentLoad: 3,
    specialists: [
      { name: 'Dr. Kadam', type: 'trauma surgeon', available: true },
      { name: 'Dr. Varma', type: 'neurologist', available: true }
    ]
  },
  {
    name: 'Ruby Hall Clinic Wanowrie',
    address: 'Azad Nagar, Wanowrie, Pune, Maharashtra 411040',
    phone: '9823101026',
    location: {
      type: 'Point',
      coordinates: [73.8985, 18.4905]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'general', 'other'],
    totalICUBeds: 28,
    availableICUBeds: 11,
    emergencyDeptOpen: true,
    currentLoad: 4,
    specialists: [
      { name: 'Dr. Kazi', type: 'cardiologist', available: true },
      { name: 'Dr. Salunkhe', type: 'neurologist', available: true }
    ]
  },
  {
    name: 'Ace Hospital & Research Centre',
    address: 'Karve Road, Erandwane, Pune, Maharashtra 411004',
    phone: '9823101027',
    location: {
      type: 'Point',
      coordinates: [73.834, 18.5065]
    },
    emergencyTypes: ['cardiac', 'trauma', 'stroke', 'general', 'other'],
    totalICUBeds: 22,
    availableICUBeds: 8,
    emergencyDeptOpen: true,
    currentLoad: 4,
    specialists: [
      { name: 'Dr. Agrawal', type: 'cardiologist', available: true },
      { name: 'Dr. Mehta', type: 'trauma surgeon', available: true }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    await Hospital.deleteMany({});
    console.log('Existing hospitals cleared');

    await Hospital.insertMany(hospitals);
    console.log(`${hospitals.length} Pune hospitals seeded successfully`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
