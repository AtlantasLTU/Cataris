import React from "react";
import { motion, type Variants, type TargetAndTransition } from "framer-motion";

interface CardProps {
  card: {
    suit: string;
    rank: string;
  };
  status?: "win" | "lose" | "neutral" | "tie";
  flipped?: boolean;
}

interface CardWrapperProps {
  children: React.ReactNode;
  borderClass: string;
  baseShadow: string;
  winPulse: TargetAndTransition;
}

const CardWrapper: React.FC<CardWrapperProps> = ({ children, borderClass, baseShadow, winPulse }) => (
  <motion.div
    className={`card flex flex-col items-center rounded-xl ${borderClass}`}
    style={{ boxShadow: baseShadow }}
    animate={winPulse}
  >
    {children}
  </motion.div>
);

const cardVariants: Variants = {
  hidden: { opacity: 0, y: -30, scale: 0.9, rotate: -5 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.25,
    },
  },
};

const Card: React.FC<CardProps> = ({
  card,
  status = "neutral",
  flipped = false,
}) => {
  const imgName = `${card.rank}_of_${card.suit}.svg`;
  const imgPath = `/src/assets/Cards/${imgName}`;

  // Stała ramka (bez animacji skali)
  const borderClass =
    status === "win"
      ? "border-4 border-green-400"
      : status === "lose"
        ? "border-4 border-red-500"
        : status === "tie"
          ? "border-4 border-yellow-400"
          : "border-2 border-transparent";

  // Statyczny cień dla przegranej
  const baseShadow =
    status === "lose"
      ? "0 0 20px rgba(239,68,68,0.9)"
      : status === "win"
        ? "0 0 0 rgba(34,197,94,0)" // start dla animacji
        : "none";

  // Pulsujący box-shadow tylko przy wygranej
  const winPulse =
    status === "win"
      ? {
        boxShadow: [
          "0 0 0 rgba(34,197,94,0)",
          "0 0 22px rgba(34,197,94,0.95)",
          "0 0 0 rgba(34,197,94,0)",
        ],
        transition: { duration: 1.1, repeat: Infinity },
      }
      : status === "tie"
        ? {
          boxShadow: [
            "0 0 0 rgba(250,204,21,0)",          // start – transparentny
            "0 0 22px rgba(250,204,21,0.95)",   // mocny żółty glow
            "0 0 0 rgba(250,204,21,0)",         // z powrotem
          ],
          transition: { duration: 1.1, repeat: Infinity },
        }
        : {};

  // FLIP dla dealera
  if (flipped) {
    return (
      <CardWrapper borderClass={borderClass} baseShadow={baseShadow} winPulse={winPulse}>
        <motion.img
          src={imgPath}
          alt={`${card.rank} of ${card.suit}`}
          className="w-20 h-auto rounded-lg"
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1, transition: { duration: 0.4 } }}
          style={{ transformStyle: "preserve-3d" }}
        />
      </CardWrapper>
    );
  }

  // Zwykła karta
  return (
    <CardWrapper borderClass={borderClass} baseShadow={baseShadow} winPulse={winPulse}>
      <motion.img
        src={imgPath}
        alt={`${card.rank} of ${card.suit}`}
        className="w-20 h-auto rounded-lg"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      />
    </CardWrapper>
  );
};

export default Card;
