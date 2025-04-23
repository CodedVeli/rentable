import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CTAButtonProps {
  label?: string;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export default function CTAButton({ 
  label = "Get Started", 
  onClick, 
  children, 
  className = "" 
}: CTAButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-accent text-white py-3 px-6 rounded-xl font-medium shadow-md ${className}`}
      onClick={onClick}
    >
      {children || label}
    </motion.button>
  );
}