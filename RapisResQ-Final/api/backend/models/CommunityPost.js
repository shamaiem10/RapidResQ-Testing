const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'Blood Needed',
        'Missing Person',
        'Medical Emergency',
        'Shelter Needed',
        'Food / Water',
        'Disaster Help'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
      trim: true
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
      trim: true
    },
    location: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
      index: true
    },
    createdBy: {
      type: String,
      required: true,
      maxlength: 100,
      index: true,
      trim: true
    },
    urgent: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    closureNote: {
      type: String,
      maxlength: 500,
      default: '',
      trim: true
    },
    responses: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
communityPostSchema.index({ type: 1, urgent: -1, createdAt: -1 });
communityPostSchema.index({ location: 1 });
communityPostSchema.index({ createdBy: 1, createdAt: -1 });
communityPostSchema.index({ status: 1, createdAt: -1 });
communityPostSchema.index({ status: 1, urgent: -1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);