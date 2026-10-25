const mongoose = require('mongoose');

// Connect to MongoDB using MONGODB_URI environment variable
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI is not defined. Please configure MONGODB_URI in Render environment variables or .env file.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('🍃 Connected to MongoDB successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

// Automatically initiate MongoDB connection if URI is available
if (process.env.MONGODB_URI) {
  connectDB();
}

// Mongoose schema for Scan records
const scanSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    hostname: {
      type: String,
      default: ''
    },
    riskScore: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    summary: {
      type: String,
      default: ''
    },
    features: {
      type: Array,
      default: []
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.timestamp && ret.createdAt) {
          ret.timestamp = ret.createdAt;
        }
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      }
    }
  }
);

// Virtual getter for id
scanSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : undefined;
});

const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);

module.exports = {
  mongoose,
  Scan,
  connectDB
};
