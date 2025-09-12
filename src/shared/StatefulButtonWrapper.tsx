import React from "react";
import { cva } from "class-variance-authority";

import { StatefulButton } from "@openedx/paragon";
import cn from "../utils/cn";

interface StatefulButtonProps {
  className?: string;
  name?: string;
  id?: string;
  type?: string;
  variant?: "brand" | "link" | "secondary";
  state?: string;
  labels?: Record<string, React.ReactNode>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
}

interface StatefulButtonWrapperProps extends StatefulButtonProps {}

const buttonVariants = cva("tw-font-semibold tw-text-md", {
  variants: {
    variant: {
      brand: [
        "login-button-width",
        "tw-py-[10px]",
        "tw-px-[16px]",
        "tw-w-full",
        "tw-rounded-[100px]",
        "tw-bg-brand-600",
        "hover:tw-bg-brand-600",
        "active:!tw-bg-brand-700",
        "tw-border-0",
      ],
      link: ["tw-text-center", "tw-text-brand-700", "hover:tw-text-brand-600"],
      secondary: [
        "tw-py-[10px]",
        "tw-px-[16px]",
        "tw-w-full",
        "tw-rounded-[100px]",
        "tw-bg-white",
        "tw-text-brand-600",
        "tw-border-brand-600",
        "tw-border-1",
        "hover:tw-bg-brand-600",
        "active:!tw-bg-brand-700",
      ],
    },
  },
  defaultVariants: {
    variant: "brand",
  },
});

const StatefulButtonWrapper = ({
  className,
  variant,
  ...restProps
}: StatefulButtonWrapperProps) => (
  <StatefulButton
    {...restProps}
    variant={variant}
    className={cn(buttonVariants({ variant }), className)}
  />
);

export default StatefulButtonWrapper;
