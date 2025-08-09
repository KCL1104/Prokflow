import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Loading } from '../common/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/authService';
import type { Database } from '../../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface FormData {
  full_name: string;
  email: string;
  avatar_url: string;
  timezone: string;
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    avatar_url: '',
    timezone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { signOut, updatePassword } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await AuthService.getCurrentUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          full_name: userProfile.full_name || '',
          email: userProfile.email || '',
          avatar_url: userProfile.avatar_url || '',
          timezone: userProfile.timezone || ''
        });
      }
<<<<<<< HEAD
    } catch (err) {
=======
    } catch {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await AuthService.updateUserProfile({
        full_name: formData.full_name,
        timezone: formData.timezone,
        avatar_url: formData.avatar_url
      });
      
      setSuccess('Profile updated successfully!');
      await loadUserProfile(); // Reload to get updated data
<<<<<<< HEAD
    } catch (err) {
=======
    } catch {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Note: In a real app, you'd want to verify the current password first
      const { error } = await updatePassword(passwordData.newPassword);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      }
<<<<<<< HEAD
    } catch (err) {
=======
    } catch {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      setError('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
<<<<<<< HEAD
    } catch (err) {
=======
    } catch {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return <Loading size="large" text="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                        disabled
                        title="Email cannot be changed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                    </div>
                  </div>



                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    >
                      <option value="">Select timezone</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Australia/Sydney">Sydney (AEDT)</option>
                    </select>
                  </div>
                </div>



                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Picture */}
<<<<<<< HEAD
              <div className="bg-gray-50 p-4 rounded-lg">
=======
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Picture</h4>
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Profile"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
<<<<<<< HEAD
                    <Button variant="secondary" size="small">
=======
                    <Button variant="secondary" size="sm">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
<<<<<<< HEAD
              <div className="bg-gray-50 p-4 rounded-lg">
=======
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                <h4 className="text-sm font-medium text-gray-900 mb-3">Account Security</h4>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
<<<<<<< HEAD
                    size="small"
=======
                    size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                    className="w-full"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    Change Password
                  </Button>
                  
                  <Button
<<<<<<< HEAD
                    variant="danger"
                    size="small"
=======
                    variant="destructive"
                    size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Account Info */}
<<<<<<< HEAD
              <div className="bg-gray-50 p-4 rounded-lg">
=======
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Member since:</span>
                    <br />
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Last updated:</span>
                    <br />
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
<<<<<<< HEAD
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
=======
            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-gray-200">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
<<<<<<< HEAD
                    size="small"
=======
                    size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                    loading={saving}
                    disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
<<<<<<< HEAD
                    size="small"
=======
                    size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
