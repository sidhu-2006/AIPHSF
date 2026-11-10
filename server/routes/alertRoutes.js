const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Hospital = require('../models/Hospital');

router.post('/', async(req,res)=>{
    try{
        const{ hospitalId, emergencyType, patientAge, notes }=req.body;
        if(!hospitalId || !emergencyType || !patientAge){
            return res.status(400).json({
                success:false,
                message:'Hospital ID, emergency type and patient age are required'
            });
        } 
        const hospital=await Hospital.findById(hospitalId);
        if(!hospital) {
            return res.status(404).json({
                success:false,
                message:'hospital not found'
            });
        }
        const alert=await Alert.create({
            hospitalId,
            emergencyType,
            patientAge,
            notes
        });
        res.status(201).json({
            success:true,
            demoOnly: true,
            message: 'Demo selection recorded. No hospital notification was sent.',
            data:alert
        });
    } catch(error){
        if(error.name === 'ValidationError') {
            return res.status(400).json({
                success:false,
                message:error.message
            });
        }
        res.status(500).json({
            success:false,
            message:'Server error while creating alert'
        });
    }
});
router.get('/',async(req,res)=>{
        try{
            const alerts=await Alert.find({})
            .populate('hospitalId', 'name address phone')
            .sort({createdAt: -1});
            res.status(200).json({
                success:true,
                count:alerts.length,
                data:alerts
            });
        } catch (error){
            res.status(500).json({
                success:false,
                message:'Server error while fetching alerts'
            });
        }
    });
module.exports=router;
