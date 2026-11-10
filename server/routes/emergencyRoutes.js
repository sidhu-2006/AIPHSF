const express=require('express');
const router=express.Router();
const EmergencyRequest=require('../models/EmergencyRequest');
const Hospital=require('../models/Hospital');

router.post('/', async (req, res) => {
  try {
    const { emergencyType, patientAge, notes, userLocation } = req.body;

    if (!emergencyType || !patientAge || !userLocation) {
      return res.status(400).json({
        success: false,
        message: 'Emergency type, patient age and location are required'
      });
    }

    const emergencyRequest = await EmergencyRequest.create({
        emergencyType,
        patientAge,
        notes,
        userLocation
    });
    res.status(201).json({
        success:true,
        data:emergencyRequest
    });
} catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    res.status(500).json({
        success:false,
        message: 'Server error while creating emergency request'
    });
}
});

router.get('/', async(req,res)=>{
    try{
        const emergencies = await EmergencyRequest.find({})
        .populate('recommendedHospital','name address phone')
        .sort({createdAt: -1});

        res.status(200).json({
            success:true,
            count: emergencies.length,
            data: emergencies
        });
    } catch(error){
        res.status(500).json({
            success:false,
            message:'Server error while fetching emergency requests'
        });
    }
});
module.exports=router;