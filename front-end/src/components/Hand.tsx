import React from "react";
import CardComponent from "./Card";
import { motion } from "framer-motion";
import backCard from "../assets/Cards/BackCard.svg";
import type { Card } from "../assets/CardDeck";

interface HandProps {
    cards: Card[];
    title: string;
    handValue: number;
    hideFirstCard?: boolean;
    status?: "win" | "lose" | "neutral" | "tie";
}

const handVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            when: "beforeChildren",
        },
    },
};

export default function Hand({
    cards,
    title,
    handValue,
    hideFirstCard = false,
    status = "neutral",
}: HandProps) {
    return (
        <div className="p-4 rounded-xl">
            <h2 className="text-2xl mb-2">
                {title}:{handValue}
            </h2>

            <motion.div
                className="flex flex-row"
                variants={handVariants}
                initial="hidden"
                animate="visible"
            >
                {cards.map((card, index) => {
                    // ❗ Nakładanie i opadanie kart robimy na style, nie Tailwind
                    const style: React.CSSProperties = {
                        marginLeft: index === 0 ? 0 : -24, // -24px overlap (zwiększ do -32/-40 jeśli chcesz większe nachodzenie)
                        marginTop: index * 6,              // każda kolejna o 6px niżej
                    };

                    const cardKey = `${card.suit}-${card.rank}`;

                    if (hideFirstCard && index === 0) {
                        // zakryta pierwsza karta dealera
                        return (
                            <motion.img
                                key={cardKey}
                                src={backCard}
                                alt="Hidden card"
                                className="w-20 h-30 rounded-lg"
                                style={style}
                            />
                        );
                    }

                    // zwykła karta
                    return (
                        <div key={cardKey} style={style}>
                            <CardComponent card={card} status={status} />
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}
