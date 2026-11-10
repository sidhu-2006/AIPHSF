const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['cardiologist' , 'trauma surgeon', 'burn specialist', 'neurologist', 'pulmonologist', 'general']
    },
    available: {
        type: Boolean, 
        default: false
    }
    
});

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
    coordinates: {
        type: [Number],
        required: true
    } 
    },
    emergencyTypes: {
        type: [String],
        enum: ['cardiac','stroke','trauma','respiratory','burns','general','other'],
        required: true
    },
    totalICUBeds: {
        type: Number,
        required: true,
        min: 0
    },
    availableICUBeds: {
        type: Number,
        required: true,
        min: 0
    },
    specialists: {
    type: [specialistSchema],
    default: []
    },
    emergencyDeptOpen:{
        type: Boolean,
        required: true,
        default: false
    },
    currentLoad: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});
hospitalSchema.index({ location: '2dsphere'});

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
