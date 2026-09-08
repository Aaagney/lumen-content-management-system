const { SubscriptionStore } = require('../models/Subscription');

// Available Subscription Plans Configuration
const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Starter Author Tier',
    price: 9,
    currency: '$',
    period: '/month',
    duration: '1 Month',
    popular: false,
    description: 'Perfect for emerging writers taking their first steps in digital publishing.',
    features: [
      'Publish up to 5 articles per month',
      'Standard Author profile badge',
      'Basic reader analytics & view counts',
      'Community discussion & comments access',
      'Standard editorial review (48h turnaround)',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'Professional Writer',
    price: 19,
    currency: '$',
    period: '/month',
    duration: '1 Month',
    popular: true,
    description: 'For dedicated authors seeking wider audience reach, quizzes, and priority review.',
    features: [
      'Unlimited article publishing',
      'Interactive Quiz creation & attachments',
      'Verified Author badge & custom bio links',
      'Priority editorial review (12h turnaround)',
      'In-depth reader engagement & retention metrics',
      'Bookmark & social share tracking',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Elite & Syndicated',
    price: 39,
    currency: '$',
    period: '/month',
    duration: '1 Month',
    popular: false,
    description: 'Maximum exposure, homepage spotlight, newsletter syndication, and VIP perks.',
    features: [
      'Everything included in Standard',
      'Featured Homepage Hero spotlight banner',
      'Weekly curated Newsletter syndication',
      'Direct reader patronage & tips support',
      'VIP Instant editorial review (under 2h)',
      'Exclusive Author Masterclasses & webinars',
    ],
  },
];

// GET /api/subscribe/plans
exports.getPlans = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      plans: SUBSCRIPTION_PLANS,
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message,
    });
  }
};

// GET /api/subscribe/status/:authorId
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: 'Author ID is required',
      });
    }

    const activeSubscription = await SubscriptionStore.findActiveByAuthorId(authorId);

    if (!activeSubscription) {
      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        status: 'None',
        message: 'No active subscription found for this author.',
        subscription: null,
      });
    }

    const now = new Date();
    const expiry = new Date(activeSubscription.endDate);
    const diffTime = expiry - now;
    const remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return res.status(200).json({
      success: true,
      hasActiveSubscription: true,
      status: activeSubscription.status,
      remainingDays,
      subscription: activeSubscription,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription status',
      error: error.message,
    });
  }
};

// POST /api/subscribe/:authorId
exports.subscribe = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { plan: requestedPlanName, authorName, authorEmail, duration } = req.body;

    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: 'Author ID is required',
      });
    }

    if (!requestedPlanName) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a subscription plan (Basic, Standard, or Premium)',
      });
    }

    // Match plan (case-insensitive)
    const selectedPlan = SUBSCRIPTION_PLANS.find(
      (p) => p.name.toLowerCase() === requestedPlanName.trim().toLowerCase()
    );

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan '${requestedPlanName}'. Available plans are: Basic, Standard, Premium.`,
      });
    }

    // Check for existing active subscription
    const existingActive = await SubscriptionStore.findActiveByAuthorId(authorId);

    if (existingActive) {
      if (existingActive.plan.toLowerCase() === selectedPlan.name.toLowerCase()) {
        return res.status(400).json({
          success: false,
          code: 'ALREADY_SUBSCRIBED',
          message: `You are already actively subscribed to the ${selectedPlan.name} plan.`,
          currentSubscription: existingActive,
        });
      }

      // If author is switching to another plan, cancel previous active plan
      await SubscriptionStore.cancel(authorId);
    }

    const startDate = new Date();
    // Default 30 days subscription duration
    const durationDays = duration === '1 Year' ? 365 : duration === '3 Months' ? 90 : 30;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const newSubData = {
      authorId: String(authorId),
      authorName: authorName || 'Author #' + authorId,
      authorEmail: authorEmail || '',
      plan: selectedPlan.name,
      price: selectedPlan.price,
      currency: selectedPlan.currency,
      duration: selectedPlan.duration,
      features: selectedPlan.features,
      status: 'Active',
      startDate,
      endDate,
      autoRenew: true,
    };

    const createdSub = await SubscriptionStore.create(newSubData);

    return res.status(201).json({
      success: true,
      message: `Successfully subscribed to the ${selectedPlan.name} plan!`,
      subscription: createdSub,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process author subscription',
      error: error.message,
    });
  }
};

// DELETE /api/subscribe/:authorId
exports.cancelSubscription = async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: 'Author ID is required',
      });
    }

    const activeSub = await SubscriptionStore.findActiveByAuthorId(authorId);

    if (!activeSub) {
      return res.status(404).json({
        success: false,
        code: 'NO_ACTIVE_SUBSCRIPTION',
        message: 'No active subscription found to cancel for this author.',
      });
    }

    const cancelledSub = await SubscriptionStore.cancel(authorId);

    return res.status(200).json({
      success: true,
      message: `Your ${activeSub.plan} subscription has been successfully cancelled.`,
      subscription: cancelledSub,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message,
    });
  }
};

// GET /api/subscribe/history/:authorId
exports.getSubscriptionHistory = async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: 'Author ID is required',
      });
    }

    const history = await SubscriptionStore.findHistoryByAuthorId(authorId);

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription history',
      error: error.message,
    });
  }
};
