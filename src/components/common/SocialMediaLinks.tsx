'use client';

import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Folder } from 'lucide-react';
import { getStoreSettings } from '@/lib/store-settings';

interface SocialMediaLinks {
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  pinterest_url?: string;
  [key: string]: string | undefined;
}

interface SocialMediaLinksProps {
  className?: string;
  iconSize?: number;
  iconClassName?: string;
  showLabels?: boolean;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  className = "",
  iconSize = 20,
  iconClassName = "text-pink-600 hover:text-pink-800 transition-colors",
  showLabels = false
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLinks>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const settings = await getStoreSettings();
        const links: SocialMediaLinks = {};
        
        // Extract social media URLs from settings
        Object.keys(settings).forEach(key => {
          if (key.endsWith('_url') && settings[key]) {
            links[key] = settings[key];
          }
        });
        
        setSocialLinks(links);
      } catch (error) {
        console.error('Error fetching social media links:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse flex space-x-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
      ))}
    </div>;
  }

  // Get list of social media links that have values
  const availableSocialLinks = Object.entries(socialLinks).filter(([_, url]) => url);

  if (availableSocialLinks.length === 0) {
    return null;
  }

  // Function to get the appropriate icon for a social media platform
  const getSocialIcon = (key: string) => {
    switch (key) {
      case 'facebook_url':
        return <Facebook size={iconSize} />;
      case 'instagram_url':
        return <Instagram size={iconSize} />;
      case 'twitter_url':
        return <Twitter size={iconSize} />;
      case 'youtube_url':
        return <Youtube size={iconSize} />;
      default:
        return <Folder size={iconSize} />;
    }
  };

  // Function to get friendly name from key
  const getSocialName = (key: string) => {
    const name = key.replace('_url', '');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {availableSocialLinks.map(([key, url]) => (
        <a 
          key={key} 
          href={url}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2"
          aria-label={`Visit our ${getSocialName(key)} page`}
        >
          <span className={iconClassName}>{getSocialIcon(key)}</span>
          {showLabels && <span className="text-sm">{getSocialName(key)}</span>}
        </a>
      ))}
    </div>
  );
};

export default SocialMediaLinks; 