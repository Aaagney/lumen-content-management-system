const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      default: 'Author',
    },
    authorEmail: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      required: true,
      enum: ['Basic', 'Standard', 'Premium'],
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: '$',
    },
    duration: {
      type: String,
      default: '1 Month',
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Expired'],
      default: 'Active',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    transactionId: {
      type: String,
      default: () => 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    },
  },
  {
    timestamps: true,
  }
);

// In-memory mock store used if MongoDB service is not actively connected
const inMemoryStore = [];

const SubscriptionModel = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

// Hybrid Data Access Layer that seamlessly uses Mongoose when connected or in-memory array if MongoDB is offline
class SubscriptionStore {
  static async findActiveByAuthorId(authorId) {
    if (mongoose.connection.readyState === 1) {
      const now = new Date();
      // Auto-expire any subscription whose endDate has passed
      await SubscriptionModel.updateMany(
        { authorId: String(authorId), status: 'Active', endDate: { $lt: now } },
        { status: 'Expired' }
      );
      return await SubscriptionModel.findOne({ authorId: String(authorId), status: 'Active' });
    } else {
      const now = new Date();
      inMemoryStore.forEach((sub) => {
        if (String(sub.authorId) === String(authorId) && sub.status === 'Active' && new Date(sub.endDate) < now) {
          sub.status = 'Expired';
        }
      });
      return inMemoryStore.find((sub) => String(sub.authorId) === String(authorId) && sub.status === 'Active') || null;
    }
  }

  static async findHistoryByAuthorId(authorId) {
    if (mongoose.connection.readyState === 1) {
      return await SubscriptionModel.find({ authorId: String(authorId) }).sort({ createdAt: -1 });
    } else {
      return inMemoryStore
        .filter((sub) => String(sub.authorId) === String(authorId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      const doc = new SubscriptionModel(data);
      return await doc.save();
    } else {
      const doc = {
        _id: 'sub_' + Math.random().toString(36).substring(2, 11),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.push(doc);
      return doc;
    }
  }

  static async cancel(authorId) {
    if (mongoose.connection.readyState === 1) {
      const active = await SubscriptionModel.findOne({ authorId: String(authorId), status: 'Active' });
      if (!active) return null;
      active.status = 'Cancelled';
      active.cancelledAt = new Date();
      active.autoRenew = false;
      return await active.save();
    } else {
      const active = inMemoryStore.find((sub) => String(sub.authorId) === String(authorId) && sub.status === 'Active');
      if (!active) return null;
      active.status = 'Cancelled';
      active.cancelledAt = new Date();
      active.autoRenew = false;
      active.updatedAt = new Date();
      return active;
    }
  }

  static getStore() {
    return inMemoryStore;
  }
}

module.exports = {
  SubscriptionModel,
  SubscriptionStore,
};
