// Auth Imports
import { IRoute } from '@/types/types';
import {
  HiOutlineHome,
  HiOutlineCpuChip,
  // HiOutlineUsers,
  HiOutlineCog8Tooth,
  // HiOutlineCreditCard,
  // HiOutlineCurrencyDollar,
  HiOutlinePaintBrush,
} from 'react-icons/hi2';

export const routes: IRoute[] = [
  {
    name: 'Main Dashboard',
    path: '/dashboard/main',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
  },
  {
    name: 'Agent Playground',
    path: '/dashboard/agent-playground',
    icon: <HiOutlineCpuChip className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
  },
  {
    name: 'Profile Settings',
    path: '/dashboard/settings',
    icon: <HiOutlineCog8Tooth className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
  },
  // {
  //   name: 'Users List',
  //   path: '/dashboard/users-list',
  //   icon: <HiOutlineUsers className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //   collapse: false,
  //   disabled: true,
  // },
  // {
  //   name: 'Subscription',
  //   path: '/dashboard/subscription',
  //   icon: <HiOutlineCreditCard className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //   collapse: false,
  //   disabled: true,
  // },
  {
    name: 'Widget Studio',
    path: '/dashboard/widget-studio',
    icon: <HiOutlinePaintBrush className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: false,
  },
  // {
  //   name: 'Pricing Page',
  //   path: '/pricing',
  //   icon: <HiOutlineCurrencyDollar className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //   collapse: false,
  //   disabled: true,
  // },
];
