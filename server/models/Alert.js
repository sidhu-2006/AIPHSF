const mongoose = require('mongoose');
const alertSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required:true
    },
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
    status:{
        type:String,
        enum:['demo_recorded','sent','acknowledged'],
        default:'demo_recorded'
    }
}, {
    timestamps:true
});
const Alert = mongoose.model('Alert', alertSchema);
module.exports=Alert;
