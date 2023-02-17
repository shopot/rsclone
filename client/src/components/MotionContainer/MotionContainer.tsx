import { motion } from 'framer-motion';

export declare interface MotionContainerProps {
  key: string;
  children: React.ReactNode;
}

export const MotionContainer = ({ key, children }: MotionContainerProps) => {
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
      key={key}
      initial="initial"
      animate="in"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};
