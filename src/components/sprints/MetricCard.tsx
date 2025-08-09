import React from 'react';
import { Icon, type IconName } from '../common/Icon';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: IconName;
  iconColor: string;
  additionalInfo?: string;
  valueColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  additionalInfo,
  valueColor = 'text-gray-900'
}) => {
  return (
<<<<<<< HEAD
    <div className="bg-white rounded-lg border border-gray-200 p-6">
=======
    <div className="bg-warm-25 rounded-lg border-2 border-default p-6 hover:bg-warm-50 transition-colors duration-150">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <Icon name={icon} className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${valueColor}`}>
          {value}
        </p>
        <p className="text-sm text-gray-600">{subtitle}</p>
        {additionalInfo && (
          <div className="mt-2 text-xs text-gray-500">
            {additionalInfo}
          </div>
        )}
      </div>
    </div>
  );
};