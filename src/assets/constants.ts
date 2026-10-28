import type { IconType } from 'react-icons';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineDownload,
} from 'react-icons/hi';

export interface NavLinkItem {
  name: string;
  arabicName: string;
  to: string;
  icon: IconType;
}

export const links: NavLinkItem[] = [
  { name: 'Discover Surahs', arabicName: 'تصفح السور', to: '/', icon: HiOutlineHome },
  { name: 'Quran Reciters', arabicName: 'القراء والتلاوات', to: '/top-reciters', icon: HiOutlineUserGroup },
  { name: 'Downloads', arabicName: 'التحميلات', to: '/downloads', icon: HiOutlineDownload },
];
