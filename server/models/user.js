const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        email: { 
            type: String,
            required: true,
            unique: true,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
        password: {type: String, required: true}
        // ,
        // userStatus: {type: String, required: true, default: "active"}
    },
    { timestamps: true }
);

// export const active = "active"
// export const suspended = "suspended"
// export const deactivated = "deactivated"

module.exports = mongoose.model('User', userSchema)
