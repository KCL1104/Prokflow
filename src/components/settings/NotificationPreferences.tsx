import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { emailService, type EmailPreferences } from '../../services/emailService';
import { useAuth } from '../../hooks/useAuth';
import { Bell, TestTube } from 'lucide-react';

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    userId: '',
    notifications: {
      projectUpdates: true,
      taskAssignments: true,
      deadlineReminders: true,
      teamInvitations: true,
      systemAlerts: true,
      weeklyDigest: false,
      monthlyReport: false,
    },
    frequency: 'immediate',
    unsubscribeToken: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // For now, use default preferences since getEmailPreferences doesn't exist
        // In a real implementation, you would fetch from the backend
        setLoading(false);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast.error('Failed to load notification preferences');
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handlePreferenceChange = async (key: keyof EmailPreferences['notifications'], value: boolean) => {
    const updatedPrefs = { 
      ...preferences, 
      notifications: {
        ...preferences.notifications,
        [key]: value
      }
    };
    setPreferences(updatedPrefs);
    
    setSaving(true);
    try {
      if (user?.id) {
        await emailService.updateEmailPreferences(user.id, { 
          notifications: {
            ...preferences.notifications,
            [key]: value
          }
        });
        toast.success('Preference updated successfully');
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      toast.error('Failed to update preference');
      // Revert the change
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      if (user?.email) {
        await emailService.sendEmail({
          to: [{ email: user.email, name: user.fullName || user.email, type: 'to' }],
          subject: 'Test Email from Kiro Pro',
          htmlContent: '<h1>Test Email</h1><p>This is a test email to verify your notification settings.</p>',
          textContent: 'Test Email - This is a test email to verify your notification settings.'
        });
        toast.success('Test email sent successfully! Check your inbox.');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const preferenceItems = [
    {
      key: 'projectUpdates' as keyof EmailPreferences['notifications'],
      title: 'Project Updates',
      description: 'When projects you\'re involved with are updated'
    },
    {
      key: 'taskAssignments' as keyof EmailPreferences['notifications'],
      title: 'Task Assignments',
      description: 'When a task is assigned to you'
    },
    {
      key: 'deadlineReminders' as keyof EmailPreferences['notifications'],
      title: 'Deadline Reminders',
      description: 'Reminders about upcoming deadlines'
    },
    {
      key: 'teamInvitations' as keyof EmailPreferences['notifications'],
      title: 'Team Invitations',
      description: 'When you are invited to join a team or project'
    },
    {
      key: 'systemAlerts' as keyof EmailPreferences['notifications'],
      title: 'System Alerts',
      description: 'Important system notifications and updates'
    },
    {
      key: 'weeklyDigest' as keyof EmailPreferences['notifications'],
      title: 'Weekly Digest',
      description: 'Weekly summary of your activities and updates'
    },
    {
      key: 'monthlyReport' as keyof EmailPreferences['notifications'],
      title: 'Monthly Report',
      description: 'Monthly report of your progress and achievements'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Loading your notification preferences...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose which email notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {preferenceItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
              <Switch
                checked={preferences.notifications[item.key]}
                onCheckedChange={(checked) => handlePreferenceChange(item.key, checked)}
                disabled={saving}
              />
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Button
            onClick={handleTestEmail}
            disabled={testing}
            variant="outline"
            className="w-full"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Send a test notification to verify your email settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationPreferences;