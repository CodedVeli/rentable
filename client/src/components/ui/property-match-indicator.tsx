import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PropertyMatchIndicatorProps {
  matchPercentage: number; // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
  showAnimation?: boolean;
  initialLoad?: boolean;
}

export function PropertyMatchIndicator({
  matchPercentage,
  size = "md",
  className,
  showAnimation = true,
  initialLoad = true,
}: PropertyMatchIndicatorProps) {
  const [isVisible, setIsVisible] = useState(!initialLoad);
  const [isHovered, setIsHovered] = useState(false);

  // Determine size classes
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm"
  };

  // Determine color based on match percentage
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-50 ring-green-200";
    if (percentage >= 80) return "text-blue-600 bg-blue-50 ring-blue-200";
    if (percentage >= 70) return "text-indigo-600 bg-indigo-50 ring-indigo-200";
    if (percentage >= 60) return "text-purple-600 bg-purple-50 ring-purple-200";
    return "text-slate-600 bg-slate-50 ring-slate-200";
  };

  // Simulated loading effect
  useEffect(() => {
    if (initialLoad) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialLoad]);

  // Framer Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.1
      }
    },
    hover: {
      scale: isHovered ? 1.05 : 1,
      boxShadow: isHovered ? "0px 5px 15px rgba(0, 0, 0, 0.1)" : "0px 2px 5px rgba(0, 0, 0, 0.05)",
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const numberVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={cn(
        "rounded-full inline-flex items-center justify-center shadow-sm ring-1 ring-inset font-medium relative",
        getMatchColor(matchPercentage),
        sizeClasses[size],
        className
      )}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      whileHover="hover"
      variants={showAnimation ? containerVariants : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.span 
        variants={showAnimation ? numberVariants : {}}
        initial="initial"
        animate="animate"
        key={matchPercentage} // Re-run animation when percentage changes
      >
        {matchPercentage}% match
      </motion.span>
      
      {isHovered && (
        <motion.div 
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded px-2 py-1 text-xs z-10 whitespace-nowrap text-slate-800"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {matchPercentage >= 90 ? "Perfect match!" : 
           matchPercentage >= 80 ? "Great match" : 
           matchPercentage >= 70 ? "Good match" : 
           matchPercentage >= 60 ? "Decent match" : "Basic match"}
        </motion.div>
      )}
    </motion.div>
  );
}

export default PropertyMatchIndicator;