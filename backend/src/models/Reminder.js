import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/
  },
  category: {
    type: String,
    required: true,
    enum: ['work', 'personal', 'shopping', 'health', 'other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isLocationBased: {
    type: Boolean,
    default: false
  },
  location: {
    name: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firebaseId: {
    type: String,
    sparse: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'push'],
      required: true
    },
    time: {
      type: Number, // minutes before the reminder
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes
reminderSchema.index({ user: 1, date: 1 });
reminderSchema.index({ user: 1, category: 1 });
reminderSchema.index({ 'location.coordinates': '2dsphere' });

// Methods
reminderSchema.methods.markComplete = async function() {
  this.isCompleted = true;
  await this.save();
  
  // Update user stats
  await this.model('User').findByIdAndUpdate(this.user, {
    $inc: {
      'stats.completedReminders': 1
    }
  });
};

reminderSchema.methods.reschedule = async function(newDate, newTime) {
  this.date = newDate;
  this.time = newTime;
  await this.save();
};

// Statics
reminderSchema.statics.findUpcoming = function(userId, limit = 5) {
  return this.find({
    user: userId,
    isCompleted: false,
    date: { $gte: new Date() }
  })
  .sort('date')
  .limit(limit);
};

reminderSchema.statics.findByCategory = function(userId, category) {
  return this.find({
    user: userId,
    category,
    isCompleted: false
  }).sort('date');
};

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder; 