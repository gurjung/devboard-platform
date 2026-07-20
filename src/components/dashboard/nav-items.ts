import { IconType } from "react-icons";
import {
  HiOutlineSquares2X2,
  HiOutlineFolder,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: HiOutlineSquares2X2,
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: HiOutlineFolder,
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: HiOutlineUsers,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: HiOutlineCog6Tooth,
  },
];
