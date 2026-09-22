/**
 * DEMO integration routes.
 *
 * These simulate a host CMS's "create post" / "create comment" endpoints,
 * showing exactly how a real system should wire in the Spam & Abuse
 * Detection module:
 *
 *   restriction check -> detector.analyzeContent -> act on result
 *
 * When integrating into a real CMS, replace the in-memory "save" step
 * below with the CMS's actual database write, but keep the same
 * before/after flow around detectionService.analyzeContent.
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const detectionService = require('../services/detectionService');
const restrictionService = require('../services/restrictionService');

async function handleSubmission(contentType) {
  return async (req, res, next) => {
    try {
      const { userId, userName, text } = req.body;
      if (!userId || !text) {
        return res.status(400).json({ error: 'userId and text are required' });
      }

      // 1. Check account restriction BEFORE anything else
      const restricted = await restrictionService.isUserRestricted(userId);
      if (restricted) {
        const restriction = await restrictionService.getActiveRestriction(userId);
        return res.status(403).json({
          error: `You are temporarily restricted from posting ${contentType}s`,
          restriction
        });
      }

      // 2. Run the spam/abuse detector
      const contentId = uuidv4();
      const { detection } = await detectionService.analyzeContent({
        userId,
        userName,
        contentId,
        contentType,
        text
      });

      // 3. Act on the result
      if (detection.action === 'BLOCK') {
        return res.status(403).json({
          error: `Your ${contentType} was blocked for review`,
          detection
        });
      }

      // ALLOW or FLAG both let the content "save" — FLAG just routes it to
      // admin review while remaining visible/pending, per spec.
      const saved = {
        id: contentId,
        userId,
        userName,
        contentType,
        text,
        status: detection.action === 'FLAG' ? 'PENDING_REVIEW' : 'PUBLISHED',
        createdAt: new Date().toISOString()
      };

      return res.status(201).json({ content: saved, detection });
    } catch (err) {
      next(err);
    }
  };
}

router.post('/posts', async (req, res, next) => (await handleSubmission('post'))(req, res, next));
router.post('/comments', async (req, res, next) => (await handleSubmission('comment'))(req, res, next));

module.exports = router;
