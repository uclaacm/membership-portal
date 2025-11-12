import { Request, Response } from 'express';
import { InternshipApplication } from '../models/InternshipApplication';

export class InternshipApplicationController {
  // Create a new internship application
  async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const application = new InternshipApplication(req.body);
      await application.save();
      
      res.status(201).json({
        success: true,
        data: application,
        message: 'Application submitted successfully',
      });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'An application with this email already exists',
        });
      } else if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error creating application',
          error: error.message,
        });
      }
    }
  }

  // Get all internship applications
  async getAllApplications(req: Request, res: Response): Promise<void> {
    try {
      const { status, committee, userId, page = 1, limit = 10 } = req.query;
      
      // Build query object with validated parameters
      const query: Record<string, string> = {};
      // Status is already validated by express-validator to be one of the allowed values
      if (status && typeof status === 'string') {
        query.status = status;
      }
      // Filter by committee
      if (committee && typeof committee === 'string') {
        query.committee = committee;
      }
      // Filter by userId (for member portal integration)
      if (userId && typeof userId === 'string') {
        query.userId = userId;
      }

      // Page and limit are already validated by express-validator to be positive integers
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;
      
      const applications = await InternshipApplication.find(query)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await InternshipApplication.countDocuments(query);

      res.status(200).json({
        success: true,
        data: applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message,
      });
    }
  }

  // Get a single internship application by ID
  async getApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const application = await InternshipApplication.findById(req.params.id);

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching application',
        error: error.message,
      });
    }
  }

  // Update an internship application
  async updateApplication(req: Request, res: Response): Promise<void> {
    try {
      // Extract and validate allowed fields from req.body
      const allowedFields = [
        'userId',
        'firstName',
        'lastName',
        'email',
        'phone',
        'university',
        'major',
        'graduationYear',
        'committee',
        'resumeUrl',
        'coverLetter',
        'responses',
        'status',
      ];
      
      // Build update object with only allowed fields
      const updateData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const application = await InternshipApplication.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: application,
        message: 'Application updated successfully',
      });
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error updating application',
          error: error.message,
        });
      }
    }
  }

  // Delete an internship application
  async deleteApplication(req: Request, res: Response): Promise<void> {
    try {
      const application = await InternshipApplication.findByIdAndDelete(req.params.id);

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting application',
        error: error.message,
      });
    }
  }
}
