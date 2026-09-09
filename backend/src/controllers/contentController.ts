import { Request, Response } from 'express';
import * as contentService from '../services/contentService';

export async function getAllContent(req: Request, res: Response): Promise<void> {
  try {
    const { search, status, category } = req.query;
    const items = await contentService.getAllContent({
      search: search as string | undefined,
      status: status as string | undefined,
      category: category as string | undefined,
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch content',
    });
  }
}

export async function getContentById(req: Request, res: Response): Promise<void> {
  try {
    const item = await contentService.getContentById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch content',
    });
  }
}

export async function getPending(_req: Request, res: Response): Promise<void> {
  try {
    const items = await contentService.getPendingContent();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch pending content',
    });
  }
}

export async function getPublished(_req: Request, res: Response): Promise<void> {
  try {
    const items = await contentService.getPublishedContent();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch published content',
    });
  }
}

export async function createContent(req: Request, res: Response): Promise<void> {
  try {
    const { title, author_name } = req.body;
    if (!title || !author_name) {
      res.status(400).json({ success: false, message: 'Title and author are required' });
      return;
    }
    const item = await contentService.createContent(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create content',
    });
  }
}

export async function updateContent(req: Request, res: Response): Promise<void> {
  try {
    const item = await contentService.updateContent(req.params.id, req.body);
    if (!item) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update content',
    });
  }
}

export async function approveContent(req: Request, res: Response): Promise<void> {
  try {
    const item = await contentService.approveContent(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve content',
    });
  }
}

export async function rejectContent(req: Request, res: Response): Promise<void> {
  try {
    const item = await contentService.rejectContent(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reject content',
    });
  }
}

export async function draftContent(req: Request, res: Response): Promise<void> {
  try {
    const item = await contentService.draftContent(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update content status',
    });
  }
}

export async function deleteContent(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await contentService.deleteContent(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete content',
    });
  }
}
