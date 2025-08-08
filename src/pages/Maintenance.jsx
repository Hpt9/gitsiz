import { motion } from "framer-motion";

export const Maintenance = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    style={{
      minHeight: "100vh",
      background: "#2A534F",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    {/* Animated Gear SVG */}
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      style={{ marginBottom: 32, animation: "spin 2s linear infinite" }}
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <g>
        <circle cx="50" cy="50" r="40" stroke="#fff" strokeWidth="8" fill="none" />
        <path d="M50 20 L50 5" stroke="#FFD700" strokeWidth="6" strokeLinecap="round"/>
        <path d="M50 80 L50 95" stroke="#FFD700" strokeWidth="6" strokeLinecap="round"/>
        <path d="M20 50 L5 50" stroke="#FFD700" strokeWidth="6" strokeLinecap="round"/>
        <path d="M80 50 L95 50" stroke="#FFD700" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="50" cy="50" r="10" fill="#FFD700" />
      </g>
      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </motion.svg>
    <motion.h1 
      style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      Texniki işlər aparılır
    </motion.h1>
    <motion.p 
      style={{ fontSize: "1.25rem", maxWidth: 400, textAlign: "center", marginBottom: 24 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      Sayt hazırda texniki işlər səbəbilə müvəqqəti olaraq əlçatmazdır. Zəhmət olmasa, bir az sonra yenidən yoxlayın.
    </motion.p>
    <motion.p 
      style={{ fontSize: "1rem", opacity: 0.7 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <span role="img" aria-label="tools">🛠️</span> Sizin üçün daha yaxşı təcrübə hazırlayırıq!
    </motion.p>
  </motion.div>
); 