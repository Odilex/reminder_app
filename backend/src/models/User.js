import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  fcmToken: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  stats: {
    totalReminders: { type: Number, default: 0 },
    completedReminders: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Methods
userSchema.methods.updateStats = async function(updates) {
  Object.assign(this.stats, updates);
  this.stats.lastActive = new Date();
  await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;