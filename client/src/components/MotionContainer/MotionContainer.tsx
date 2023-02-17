import { motion } from 'framer-motion';

export declare interface MotionContainerProps {
  identKey: string;
  children: React.ReactNode;
}

export const MotionContainer = ({ identKey, children }: MotionContainerProps) => {
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'linear',
    duration: 1,
  };

  return (
    <motion.div
      key={identKey}
      initial="initial"
      animate="in"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};
