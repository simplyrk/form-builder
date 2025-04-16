import React from 'react';

// Import specific icons directly
import { FileText, ClipboardList, Check, File, Settings, Home, Pencil, Box } from 'lucide-react';

// Map of icon names to components
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  FileText,
  File,
  ClipboardList,
  Check,
  Settings,
  Home,
  Pencil,
  Box
};

// Default icon as fallback
const DefaultIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 10h6" />
    <path d="M12 14h3" />
    <path d="M9 14h.01" />
  </svg>
);

/**
 * Gets a Lucide React icon component by name from our pre-defined set
 * @param iconName The name of the icon to get
 * @returns The icon component
 */
export function getLucideIcon(iconName: string = 'FileText') {
  // Look up the icon in our pre-defined map
  const IconComponent = iconMap[iconName];
  
  if (IconComponent) {
    return IconComponent;
  }
  
  // If not found, use FileText as fallback if available
  if (iconMap.FileText) {
    console.warn(`Icon "${iconName}" not found, using "FileText" instead.`);
    return iconMap.FileText;
  }
  
  // Final fallback to our built-in default icon
  console.warn(`Icon "${iconName}" not found and FileText unavailable. Using default icon.`);
  return DefaultIcon;
} 