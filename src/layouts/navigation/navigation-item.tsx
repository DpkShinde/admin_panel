"use client";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

interface NavigationItemProps {
  Icon: React.ElementType;
  name: string;
  path: string;
  onClick?: () => void;
}

const NavigationItem = ({ Icon, name, path }: NavigationItemProps) => {
  const currentPath = usePathname();
  const router = useRouter();

  const onClick = () => {
    router.push(path);
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={onClick}
        className="group relative flex items-center"
      >
        {/* Left Active Indicator */}
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            currentPath !== path && "group-hover:h-[20px]",
            currentPath === path ? "h-[36px]" : "h-[8px]"
          )}
        />

        {/* Icon Wrapper */}
        <div
          className={cn(
            "relative flex mx-3 h-[48px] w-[48px] rounded-[24px] transition-all overflow-hidden items-center justify-center",
            "group-hover:rounded-[16px] group-hover:bg-primary/10",
            currentPath === path && "bg-black text-primary rounded-[16px]"
          )}
        >

          <Icon className="w-6 h-6 group-hover:scale-110 text-white transition-transform duration-300" />
        </div>
      </button>
    </ActionTooltip>
  );
};

export default NavigationItem;
