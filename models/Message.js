
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    to: { type: String, required: true, lowercase: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
