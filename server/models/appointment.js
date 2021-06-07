const mongoose = require('mongoose');
const Schema = mongoose.Schema

const appointmentSchema = new Schema(
  {
  status: {
    type: String,
    required: true,
    default: "pending"
  },

  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  vendorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  serviceId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Service'
  },
  
  dateTime: {
    type: Date,
    required: true,
    default: Date.now
  },

  additionalInfo: {
    type: String,
    required: false
  },

  price: {
    type: String,
    required: true, 
    default: "undefined"
  }
  }
)



module.exports = mongoose.model('Appointment', appointmentSchema)
