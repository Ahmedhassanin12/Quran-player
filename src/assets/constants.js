import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineDownload,
} from 'react-icons/hi';

export const links = [
  { name: 'Discover Surahs', arabicName: 'تصفح السور', to: '/', icon: HiOutlineHome },
  { name: 'Quran Reciters', arabicName: 'القراء والتلاوات', to: '/top-reciters', icon: HiOutlineUserGroup },
  { name: 'Downloads', arabicName: 'التحميلات', to: '/downloads', icon: HiOutlineDownload },
];
