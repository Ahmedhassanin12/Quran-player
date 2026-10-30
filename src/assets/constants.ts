import type { IconType } from 'react-icons';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineDownload,
} from 'react-icons/hi';

export interface NavLinkItem {
  name: string;
  arabicName: string;
  labelKey: 'nav.discover' | 'nav.reciters' | 'nav.downloads';
  to: string;
  icon: IconType;
}

export const links: NavLinkItem[] = [
  {
    name: 'Discover',
    arabicName: 'الرئيسية',
    labelKey: 'nav.discover',
    to: '/',
    icon: HiOutlineHome,
  },
  {
    name: 'Reciters',
    arabicName: 'القرّاء',
    labelKey: 'nav.reciters',
    to: '/top-reciters',
    icon: HiOutlineUserGroup,
  },
  {
    name: 'Downloads',
    arabicName: 'التنزيلات',
    labelKey: 'nav.downloads',
    to: '/downloads',
    icon: HiOutlineDownload,
  },
];
