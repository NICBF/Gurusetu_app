/**
 * Follow Us / social links shown when user taps "Follow Us" on profile.
 * Update these URLs to match the links in the footer of the live GuruSetu website.
 */
export interface FollowUsLink {
  id: string;
  label: string;
  url: string;
  /** Icon key for UI (e.g. 'instagram', 'facebook'). */
  icon: 'instagram' | 'facebook' | 'whatsapp' | 'gmail' | 'maps' | 'youtube' | 'twitter' | 'linkedin';
  /** Background color for the tile (hex). */
  color: string;
}

/** Social links – DOMS IIT Madras. */
export const FOLLOW_US_LINKS: FollowUsLink[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    url: 'https://www.facebook.com/domsiitmadras',
    icon: 'facebook',
    color: '#1877F2',
  },
  {
    id: 'twitter',
    label: 'X',
    url: 'https://x.com/domsiitmadras',
    icon: 'twitter',
    color: '#000000',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/doms_iitmadras/',
    icon: 'instagram',
    color: '#9333ea',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/school/doms-iitmadras/',
    icon: 'linkedin',
    color: '#0A66C2',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    url: 'https://www.youtube.com/@domsiitm2323',
    icon: 'youtube',
    color: '#FF0000',
  },
];
