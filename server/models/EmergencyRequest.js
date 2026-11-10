const mongoose = require('mongoose');
const emergencyRequestSchema = new mongoose.Schema({
    emergencyType:{
        type:String,
        required:true,
        enum:['cardiac','stroke','trauma','respiratory','burns','other']
    },
    patientAge:{
        type:Number,
        required:true,
        min:0,
        max:120
    },
    notes:{
        type:String,
        trim:true,
        maxlength:100,
        default: ''
    },
    userLocation:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    recommendedHospital:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hospital',
        default:null
    },
    status: {
        type:String,
        enum:['pending','routed','admitted'],
        default:'pending'
    }
}, {
    timestamps:true
    });
emergencyRequestSchema.index({userLocation: '2dsphere'});
const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);
module.exports=EmergencyRequest;
