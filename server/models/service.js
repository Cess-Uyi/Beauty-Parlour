const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
    {
        id: mongoose.Schema.Types.ObjectId,
        name: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Service', serviceSchema)
