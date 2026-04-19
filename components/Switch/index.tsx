import React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled,
  id,
}) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
                    ${checked ? "bg-indigo-600" : "bg-gray-200"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
      >
        <span className="sr-only">{label || "Toggle"}</span>
        <span
          aria-hidden="true"
          className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
        />
      </button>
      {label && (
        <span
          className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
          onClick={() => !disabled && onCheckedChange(!checked)}
        >
          {label}
        </span>
      )}
    </div>
  );
};
