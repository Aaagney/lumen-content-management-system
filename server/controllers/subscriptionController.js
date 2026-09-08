const db = require('../config/db');

// Available subscription plans
const PLANS = [
  {
    name: 'Basic',
    price: 9,
    currency: '$',
    duration: '1 Month',
    popular: false,
    features: [
      'Standard distribution',
      'Basic analytics',
      'Community support',
    ],
  },
  {
    name: 'Standard',
    price: 19,
    currency: '$',
    duration: '1 Month',
    popular: true,
    features: [
      'Featured article placement',
      'Advanced analytics',
      'Priority review',
      'Email newsletter inclusion',
    ],
  },
  {
    name: 'Premium',
    price: 39,
    currency: '$',
    duration: '1 Month',
    popular: false,
    features: [
      'Syndicated distribution',
      'Dedicated support',
      'Custom author branding',
      'Unlimited featured posts',
    ],
  },
];

// Automatically expire old subscriptions
const syncExpiredSubscriptions = async (authorId) => {
  const query = `
    UPDATE subscriptions
    SET status = 'Expired',
        auto_renew = 0
    WHERE author_id = ?
      AND status = 'Active'
      AND end_date < NOW()
  `;

  await db.query(query, [authorId]);
};

// GET /api/subscribe/plans
exports.getPlans = (req, res) => {
  return res.json({
    success: true,
    plans: PLANS,
  });
};

// GET /api/subscribe/status/:authorId
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const authorId = req.params.authorId;

    await syncExpiredSubscriptions(authorId);

    const [rows] = await db.query(
      `
      SELECT
        s.*,
        u.fullname,
        u.email
      FROM subscriptions s
      JOIN users u ON s.author_id = u.id
      WHERE s.author_id = ?
        AND s.status = 'Active'
      ORDER BY s.created_at DESC
      LIMIT 1
      `,
      [authorId]
    );

    return res.json({
      success: true,
      subscription: rows.length > 0 ? rows[0] : null,
    });
  } catch (err) {
    console.error('Error fetching subscription status:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// POST /api/subscribe/:authorId
exports.subscribe = async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const { planName } = req.body;

    const plan = PLANS.find(
      (p) =>
        p.name.toLowerCase() ===
        (planName || '').trim().toLowerCase()
    );

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected',
      });
    }

    await syncExpiredSubscriptions(authorId);

    // Check existing active subscription
    const [existing] = await db.query(
      `
      SELECT *
      FROM subscriptions
      WHERE author_id = ?
        AND status = 'Active'
      `,
      [authorId]
    );

    if (existing.length > 0) {
      if (existing[0].plan === plan.name) {
        return res.status(400).json({
          success: false,
          message: `You already have an active ${plan.name} subscription.`,
        });
      }

      // Cancel old plan before switching
      await db.query(
        `
        UPDATE subscriptions
        SET status = 'Cancelled',
            cancelled_at = NOW(),
            auto_renew = 0
        WHERE id = ?
        `,
        [existing[0].id]
      );
    }

    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactionId =
      'TXN-' +
      Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase();

    const [result] = await db.query(
      `
      INSERT INTO subscriptions
      (
        author_id,
        plan,
        price,
        currency,
        duration,
        features,
        status,
        start_date,
        end_date,
        auto_renew,
        transaction_id
      )
      VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?, 1, ?)
      `,
      [
        authorId,
        plan.name,
        plan.price,
        plan.currency,
        plan.duration,
        JSON.stringify(plan.features),
        startDate,
        endDate,
        transactionId,
      ]
    );

    // Create notification
    await db.query(
      `
      INSERT INTO notifications
      (
        recipient_id,
        type,
        title,
        message,
        action_url
      )
      VALUES
      (
        ?,
        'SUBSCRIPTION',
        'Subscription Activated',
        ?,
        '/author/subscription'
      )
      `,
      [
        authorId,
        `Your subscription to the ${plan.name} plan ($${plan.price}/mo) is now active.`,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscriptionId: result.insertId,
      transactionId,
    });
  } catch (err) {
    console.error('Error creating subscription:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE /api/subscribe/:authorId
exports.cancelSubscription = async (req, res) => {
  try {
    const authorId = req.params.authorId;

    await syncExpiredSubscriptions(authorId);

    const [existing] = await db.query(
      `
      SELECT *
      FROM subscriptions
      WHERE author_id = ?
        AND status = 'Active'
      `,
      [authorId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found to cancel.',
      });
    }

    await db.query(
      `
      UPDATE subscriptions
      SET status = 'Cancelled',
          cancelled_at = NOW(),
          auto_renew = 0
      WHERE id = ?
      `,
      [existing[0].id]
    );

    // Create notification
    await db.query(
      `
      INSERT INTO notifications
      (
        recipient_id,
        type,
        title,
        message,
        action_url
      )
      VALUES
      (
        ?,
        'SUBSCRIPTION',
        'Subscription Cancelled',
        ?,
        '/author/subscription'
      )
      `,
      [
        authorId,
        `Your ${existing[0].plan} subscription has been cancelled.`,
      ]
    );

    return res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (err) {
    console.error('Error cancelling subscription:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET /api/subscribe/history/:authorId
exports.getSubscriptionHistory = async (req, res) => {
  try {
    const authorId = req.params.authorId;

    await syncExpiredSubscriptions(authorId);

    const [rows] = await db.query(
      `
      SELECT *
      FROM subscriptions
      WHERE author_id = ?
      ORDER BY created_at DESC
      `,
      [authorId]
    );

    return res.json({
      success: true,
      history: rows,
    });
  } catch (err) {
    console.error('Error fetching subscription history:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};