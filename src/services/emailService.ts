// Email Service for handling email notifications and communication

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  size: number;
}

export interface EmailOptions {
  to: EmailRecipient[];
  subject: string;
  template?: string;
  templateData?: Record<string, any>;
  htmlContent?: string;
  textContent?: string;
  attachments?: EmailAttachment[];
  priority?: 'high' | 'normal' | 'low';
  replyTo?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed' | 'pending';
  timestamp: Date;
  recipient: string;
  error?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template: string;
  recipients: EmailRecipient[];
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export interface EmailPreferences {
  userId: string;
  notifications: {
    projectUpdates: boolean;
    taskAssignments: boolean;
    deadlineReminders: boolean;
    teamInvitations: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
    monthlyReport: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  unsubscribeToken: string;
}

class EmailService {
  private apiKey: string;
  private apiUrl: string;
  private fromEmail: string;
  private fromName: string;
  private templates: Map<string, EmailTemplate> = new Map();
  private deliveryQueue: EmailOptions[] = [];
  private isProcessing = false;

  constructor() {
    // TODO: Load from environment variables
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.apiUrl = process.env.EMAIL_API_URL || 'https://api.emailservice.com';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@kiropro.com';
    this.fromName = process.env.FROM_NAME || 'Kiro Pro';
    
    this.initializeTemplates();
    this.startQueueProcessor();
  }

  // Initialize email templates
  private initializeTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Kiro Pro, {{userName}}!',
        htmlContent: this.getWelcomeTemplate(),
        textContent: 'Welcome to Kiro Pro! We\'re excited to have you on board.',
        variables: ['userName', 'loginUrl', 'supportEmail']
      },
      {
        id: 'task-assignment',
        name: 'Task Assignment',
        subject: 'New task assigned: {{taskTitle}}',
        htmlContent: this.getTaskAssignmentTemplate(),
        textContent: 'You have been assigned a new task: {{taskTitle}}',
        variables: ['userName', 'taskTitle', 'taskDescription', 'dueDate', 'projectName', 'taskUrl']
      },
      {
        id: 'deadline-reminder',
        name: 'Deadline Reminder',
        subject: 'Reminder: {{taskTitle}} is due {{timeUntilDue}}',
        htmlContent: this.getDeadlineReminderTemplate(),
        textContent: 'Reminder: {{taskTitle}} is due {{timeUntilDue}}',
        variables: ['userName', 'taskTitle', 'dueDate', 'timeUntilDue', 'taskUrl']
      },
      {
        id: 'project-invitation',
        name: 'Project Invitation',
        subject: 'You\'ve been invited to join {{projectName}}',
        htmlContent: this.getProjectInvitationTemplate(),
        textContent: 'You\'ve been invited to join {{projectName}}',
        variables: ['userName', 'inviterName', 'projectName', 'projectDescription', 'invitationUrl']
      },
      {
        id: 'weekly-digest',
        name: 'Weekly Digest',
        subject: 'Your weekly summary - {{weekRange}}',
        htmlContent: this.getWeeklyDigestTemplate(),
        textContent: 'Your weekly summary for {{weekRange}}',
        variables: ['userName', 'weekRange', 'completedTasks', 'upcomingTasks', 'projectUpdates']
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        subject: 'Reset your Kiro Pro password',
        htmlContent: this.getPasswordResetTemplate(),
        textContent: 'Click the link to reset your password: {{resetUrl}}',
        variables: ['userName', 'resetUrl', 'expiryTime']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<string> {
    try {
      // Validate options
      this.validateEmailOptions(options);

      // Process template if specified
      let htmlContent = options.htmlContent;
      let textContent = options.textContent;
      let subject = options.subject;

      if (options.template && options.templateData) {
        const processed = this.processTemplate(options.template, options.templateData);
        htmlContent = processed.htmlContent;
        textContent = processed.textContent;
        subject = this.replaceVariables(subject, options.templateData);
      }

      // Prepare email payload
      const emailPayload = {
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        to: options.to.filter(r => r.type === 'to'),
        cc: options.to.filter(r => r.type === 'cc'),
        bcc: options.to.filter(r => r.type === 'bcc'),
        subject,
        htmlContent,
        textContent,
        attachments: options.attachments,
        priority: options.priority || 'normal',
        replyTo: options.replyTo,
        tags: options.tags,
        metadata: options.metadata
      };

      // Send via API
      const response = await this.sendViaAPI(emailPayload);
      
      console.log('Email sent successfully:', response.messageId);
      return response.messageId;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Queue email for later delivery
  queueEmail(options: EmailOptions): void {
    this.deliveryQueue.push(options);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Send bulk emails
  async sendBulkEmails(emails: EmailOptions[]): Promise<string[]> {
    const messageIds: string[] = [];
    
    for (const email of emails) {
      try {
        const messageId = await this.sendEmail(email);
        messageIds.push(messageId);
        
        // Add delay to avoid rate limiting
        await this.delay(100);
      } catch (error) {
        console.error('Failed to send bulk email:', error);
        // Continue with other emails
      }
    }
    
    return messageIds;
  }

  // Send notification email
  async sendNotificationEmail(
    userId: string,
    type: keyof EmailPreferences['notifications'],
    templateData: Record<string, any>
  ): Promise<string | null> {
    try {
      // Check user preferences
      const preferences = await this.getUserEmailPreferences(userId);
      
      if (!preferences.notifications[type]) {
        console.log(`User ${userId} has disabled ${type} notifications`);
        return null;
      }

      // Get user email
      const userEmail = await this.getUserEmail(userId);
      if (!userEmail) {
        throw new Error(`No email found for user ${userId}`);
      }

      // Determine template based on notification type
      const templateMap: Record<string, string> = {
        taskAssignments: 'task-assignment',
        deadlineReminders: 'deadline-reminder',
        teamInvitations: 'project-invitation',
        weeklyDigest: 'weekly-digest'
      };

      const templateId = templateMap[type];
      if (!templateId) {
        throw new Error(`No template found for notification type: ${type}`);
      }

      // Send email
      return await this.sendEmail({
        to: [{ email: userEmail, type: 'to' }],
        subject: '', // Will be set by template
        template: templateId,
        templateData,
        tags: ['notification', type],
        metadata: { userId, notificationType: type }
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
      throw error;
    }
  }

  // Get email delivery status
  async getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/messages/${messageId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get delivery status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get delivery status:', error);
      throw error;
    }
  }

  // Update user email preferences
  async updateEmailPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<void> {
    try {
      // TODO: Implement API call to update preferences
      await fetch('/api/users/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, preferences })
      });
      
      console.log('Email preferences updated for user:', userId);
    } catch (error) {
      console.error('Failed to update email preferences:', error);
      throw error;
    }
  }

  // Unsubscribe user
  async unsubscribeUser(token: string): Promise<void> {
    try {
      await fetch('/api/users/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      console.log('User unsubscribed successfully');
    } catch (error) {
      console.error('Failed to unsubscribe user:', error);
      throw error;
    }
  }

  // Private methods

  private async sendViaAPI(payload: any): Promise<{ messageId: string }> {
    // TODO: Implement actual email service API call (SendGrid, Mailgun, etc.)
    const response = await fetch(`${this.apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private validateEmailOptions(options: EmailOptions): void {
    if (!options.to || options.to.length === 0) {
      throw new Error('At least one recipient is required');
    }

    if (!options.subject) {
      throw new Error('Subject is required');
    }

    if (!options.htmlContent && !options.textContent && !options.template) {
      throw new Error('Email content or template is required');
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const recipient of options.to) {
      if (!emailRegex.test(recipient.email)) {
        throw new Error(`Invalid email address: ${recipient.email}`);
      }
    }
  }

  private processTemplate(templateId: string, data: Record<string, any>): { htmlContent: string; textContent: string } {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return {
      htmlContent: this.replaceVariables(template.htmlContent, data),
      textContent: this.replaceVariables(template.textContent, data)
    };
  }

  private replaceVariables(content: string, data: Record<string, any>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return data[variable] || match;
    });
  }

  private async getUserEmailPreferences(userId: string): Promise<EmailPreferences> {
    // TODO: Implement API call to get user preferences
    const response = await fetch(`/api/users/${userId}/email-preferences`);
    return await response.json();
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    // TODO: Implement API call to get user email
    const response = await fetch(`/api/users/${userId}`);
    const user = await response.json();
    return user.email;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.deliveryQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.deliveryQueue.length > 0) {
      const email = this.deliveryQueue.shift();
      if (email) {
        try {
          await this.sendEmail(email);
          await this.delay(200); // Rate limiting
        } catch (error) {
          console.error('Failed to process queued email:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  private startQueueProcessor(): void {
    // Process queue every 30 seconds
    setInterval(() => {
      this.processQueue();
    }, 30000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Email templates

  private getWelcomeTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Kiro Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Welcome to Kiro Pro, {{userName}}!</h1>
          <p>We're excited to have you join our project management platform.</p>
          <p>Get started by logging in to your account:</p>
          <a href="{{loginUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Login to Kiro Pro</a>
          <p>If you have any questions, feel free to contact us at {{supportEmail}}.</p>
          <p>Best regards,<br>The Kiro Pro Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private getTaskAssignmentTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Task Assignment</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">New Task Assigned</h1>
          <p>Hi {{userName}},</p>
          <p>You have been assigned a new task in <strong>{{projectName}}</strong>:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">{{taskTitle}}</h3>
            <p style="margin: 0;">{{taskDescription}}</p>
            <p style="margin: 8px 0 0 0; color: #666;"><strong>Due:</strong> {{dueDate}}</p>
          </div>
          <a href="{{taskUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Task</a>
        </div>
      </body>
      </html>
    `;
  }

  private getDeadlineReminderTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deadline Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b;">⏰ Deadline Reminder</h1>
          <p>Hi {{userName}},</p>
          <p>This is a reminder that your task <strong>{{taskTitle}}</strong> is due {{timeUntilDue}}.</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <a href="{{taskUrl}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Task</a>
        </div>
      </body>
      </html>
    `;
  }

  private getProjectInvitationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Invitation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">Project Invitation</h1>
          <p>Hi {{userName}},</p>
          <p>{{inviterName}} has invited you to join the project <strong>{{projectName}}</strong>.</p>
          <p>{{projectDescription}}</p>
          <a href="{{invitationUrl}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
        </div>
      </body>
      </html>
    `;
  }

  private getWeeklyDigestTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weekly Digest</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Weekly Summary</h1>
          <p>Hi {{userName}},</p>
          <p>Here's your summary for {{weekRange}}:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>Completed Tasks: {{completedTasks}}</h3>
            <h3>Upcoming Tasks: {{upcomingTasks}}</h3>
            <h3>Project Updates: {{projectUpdates}}</h3>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ef4444;">Password Reset Request</h1>
          <p>Hi {{userName}},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="{{resetUrl}}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          <p>This link will expire in {{expiryTime}}.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;
  }
}

// Create singleton instance
export const emailService = new EmailService();

export default emailService;