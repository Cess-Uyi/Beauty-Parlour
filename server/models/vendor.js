const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        email: { 
            type: String,
            required: true,
            unique: true,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
        password: {
            type: String, 
            required: true
        },
        shopName: {
            type: String,
            required: true
        },
        service: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
        // vendorStatus: {type: String, required: true, default: "active"}
    },
    { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema)