const express = require('express');
const router = express.Router();
const Service = require('../models/service')
const mongoose = require('mongoose')
const checkAuth = require('../middleware/check-auth');


router.get('/', (req, res, next) => {
    const perPage = Number(req.query.perPage) || 5
    const currentPage = Number(req.query.currentPage) || 1
    Service.find()
    .select('name _id')
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .then(docs => {
        const result = {
            count: docs.length,
            services: docs.map(doc => {
                return {
                    id: doc._id,
                    serviceName: doc.name
                }
            })
        };
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({err: error});
    })
});


router.get('/:serviceName', (req, res, next) => {
    const name = req.params.serviceName.toLowerCase();
    Service.find({ name: name })
    .select('name _id')
    .then(doc => {
        console.log(doc)
        if(doc.length <= 0) {
            res.status(404).json({message: "No valid entry found for service"})
            return false
        }
        console.log("From database", doc)
        res.status(200).json({
            id: doc._id,
            service: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:5000/v1/services' 
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err});
    });
})

router.post('/', checkAuth, (req, res, next) => {
    const service = new Service({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name.toLowerCase()
    });
    Service.findOne({name: req.body.name.toLowerCase()})
    .then(doc => {
        if (doc) {
            return res.status(400).json({
                message: "service already exists"
            })
        }
        service.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Service successfully registered",
                registeredService: {
                    id: result._id,
                    name: result.name
                },
                viewAllServices: {
                    type: 'GET',
                    url: 'http://localhost:5000/v1/services'
                }
            })
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    });
})


router.put('/:serviceId', checkAuth, (req, res, next) => {
    const id = req.params.serviceId;
    const serviceName = req.body.name.toLowerCase()
    
    Service.findById(id)
        .select('-__v -createdAt -updatedAt')
        .then(service => {
            if(!service) {
                res.status(400).json({message: 'Record not found'})
                return false
            }
            return Service.findOne({
                name: serviceName
            })
            .then(doMatch => {
                if(doMatch) {
                    res.status(400).json({message: 'Service name previously exists'})
                    return false
                }
                service.name = serviceName
                return service
                    .save()
                    .then(result => {
                        res.status(200).json({
                            message: "Service successfully updated",
                            viewThisService: {
                                type: 'GET',
                                url: 'http://localhost:5000/v1/services/' + serviceName
                            }   
                        })
                    })
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error:err})
        })
})

  
router.delete('/:serviceName', checkAuth, (req, res, next) => {
    const name = req.params.serviceName.toLowerCase();
    Service.findOne({name: name})
    .then(doc => {
        if (!doc) {
            res.status(404).json({message: "Service not found"})
            return false 
        }
    })
    Service.deleteOne({ name: name })
    .then(result => {
        res.status(200).json({
            message: "Service deleted",
            request: 'POST',
            url: 'http://localhost5000/v1/services',
            data: {name: 'String'}  
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    })
})


module.exports = router;