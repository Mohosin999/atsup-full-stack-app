import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import {
  createResumeTemplate,
  getResumeTemplates,
  getResumeTemplateById,
  updateResumeTemplate,
  deleteResumeTemplate,
  generateSectionContent,
  improveResumeSection,
  checkAtsFriendliness,
} from '../../services/resumeBuilder';
import { ResumeContent } from '../../types';

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    const template = await createResumeTemplate(
      req.user.id,
      name || 'Untitled Resume'
    );

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create resume template',
    });
  }
};

export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getResumeTemplates(
      req.user.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result.templates,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get resume templates',
    });
  }
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await getResumeTemplateById(req.user.id, id);

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Get template error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Resume template not found',
    });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await updateResumeTemplate(
      req.user.id,
      id,
      updates
    );

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update resume template',
    });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteResumeTemplate(req.user.id, id);

    res.json({
      success: true,
      message: 'Resume template deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete template error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete resume template',
    });
  }
};

export const generateSection = async (req: AuthRequest, res: Response) => {
  try {
    const { section, context } = req.body;

    if (!section) {
      return res.status(400).json({
        success: false,
        message: 'Section name is required',
      });
    }

    const { suggestion, credits } = await generateSectionContent(
      req.user.id,
      section,
      context
    );

    res.json({
      success: true,
      data: suggestion,
      credits,
    });
  } catch (error: any) {
    console.error('Generate section error:', error);
    const status = error.message.includes('Insufficient credits') ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to generate section content',
    });
  }
};

export const improveSection = async (req: AuthRequest, res: Response) => {
  try {
    const { section, content } = req.body;

    if (!section || !content) {
      return res.status(400).json({
        success: false,
        message: 'Section name and content are required',
      });
    }

    const { improvement, credits } = await improveResumeSection(
      req.user.id,
      section,
      content
    );

    res.json({
      success: true,
      data: improvement,
      credits,
    });
  } catch (error: any) {
    console.error('Improve section error:', error);
    const status = error.message.includes('Insufficient credits') ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to improve section content',
    });
  }
};

export const checkAts = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body as { content: ResumeContent };

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    const result = await checkAtsFriendliness(content);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Check ATS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check ATS friendliness',
    });
  }
};
