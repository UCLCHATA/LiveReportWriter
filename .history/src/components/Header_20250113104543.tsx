import { motion } from 'framer-motion';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <motion.h1 
        className={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          initial={{ color: "#4f46e5" }}
          animate={{ color: ["#4f46e5", "#06b6d4", "#4f46e5"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          CHATA Live
        </motion.span>
        {" "}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Autism Diagnostic Report Generator
        </motion.span>
      </motion.h1>
    </header>
  );
}; 