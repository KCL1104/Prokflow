import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
<<<<<<< HEAD
    { name: 'Create Project', href: '/projects/new', icon: '➕', color: 'bg-blue-500' },
    { name: 'View Backlog', href: '/backlog', icon: '📋', color: 'bg-green-500' },
    { name: 'Open Board', href: '/board', icon: '📌', color: 'bg-purple-500' },
    { name: 'View Reports', href: '/reports', icon: '📊', color: 'bg-orange-500' },
=======
    { name: 'Create Project', href: '/projects/new', icon: '➕', color: 'bg-primary-500' },
    { name: 'View Backlog', href: '/backlog', icon: '📋', color: 'bg-primary-400' },
    { name: 'Open Board', href: '/board', icon: '📌', color: 'bg-primary-600' },
    { name: 'View Reports', href: '/reports', icon: '📊', color: 'bg-primary-500' },
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  ];

  const recentActivity = [
    { action: 'Created project "Mobile App"', time: '2 hours ago', icon: '📁' },
    { action: 'Updated task "Login UI"', time: '4 hours ago', icon: '✏️' },
    { action: 'Completed sprint planning', time: '1 day ago', icon: '🎯' },
    { action: 'Added team member', time: '2 days ago', icon: '👥' },
  ];

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow p-6">
=======
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Welcome section */}
      <div className="bg-warm-25 rounded-md shadow-xs border-2 border-default p-6">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
<<<<<<< HEAD
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform`}>
=======
            className="bg-warm-25 rounded-md shadow-xs border-2 border-default p-6 hover:shadow-sm hover:bg-warm-50 hover:border-medium transition-all duration-150 group"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 ${action.color} rounded-md flex items-center justify-center text-white text-xl transition-colors duration-150`}>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                {action.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {action.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<<<<<<< HEAD
        <div className="bg-white rounded-lg shadow p-6">
=======
        <div className="bg-warm-25 rounded-md shadow-xs border-2 border-default p-6">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          <div className="flex items-center">
            <div className="text-3xl">📁</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="bg-white rounded-lg shadow p-6">
=======
        <div className="bg-warm-25 rounded-md shadow-xs border-2 border-default p-6">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          <div className="flex items-center">
            <div className="text-3xl">📋</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="bg-white rounded-lg shadow p-6">
=======
        <div className="bg-warm-25 rounded-md shadow-xs border-2 border-default p-6">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          <div className="flex items-center">
            <div className="text-3xl">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed This Week</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
<<<<<<< HEAD
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center">
=======
      <div className="bg-warm-25 rounded-md shadow-xs border-2 border-default">
        <div className="p-6 border-b-2 border-default">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="divide-y divide-gray-200">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center py-4 first:pt-0 last:pb-0">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                <div className="text-2xl mr-4">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};