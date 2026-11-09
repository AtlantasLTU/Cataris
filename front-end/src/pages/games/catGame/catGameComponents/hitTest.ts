import * as THREE from "three";
import { metadata as rows } from "./Map";
import { player, position } from "./Player";
import { updateWalletBalance } from "../../../../api/auth";
import { runState, settleRun, multipliers } from "./runState";

//let resultDOM: HTMLElement | null = null;
//let finalScoreDOM: HTMLElement | null = null;

// The stake isn't taken when the run starts, so the whole result is settled here.
// multipliers[] are gross returns: x1 breaks even, x0 loses the stake, and the
// negative early rows lose more than the stake (BettingPanel caps bets at a third
// of the balance so that can't overdraw). The wager endpoint only takes positive
// amounts, so the sign picks win/loss and break-even records nothing.
const netResult = (multiplier: number): number =>
  Number((runState.bet * (multiplier - 1)).toFixed(2));

async function settle(net: number): Promise<void> {
  if (net === 0) return;

  const result = await updateWalletBalance(Math.abs(net).toFixed(2), net > 0 ? "win" : "loss");
  if ("type" in result) console.error("Failed to settle CAT run:", result.message);
}

export async function hitTest() {
  if(runState.settled) return;
  const resultDOM = document.getElementById("result-container");
  const finalScoreDOM = document.getElementById("final-score");

  const row = rows[position.currentRow - 1];
if (position.currentRow === 11) {
  if (runState.settled) return; // extra safety

  settleRun(); // ✅ this is the key line

  const idx = position.currentRow - 1;
  const multiplier = multipliers[idx];
  const payout = netResult(multiplier);

  // show UI once
  if (resultDOM) resultDOM.style.visibility = "visible";
  if (finalScoreDOM) finalScoreDOM.innerText = position.currentRow.toString();

  const jackpotDOM = document.getElementById("retry");
  if (jackpotDOM) {
    jackpotDOM.style.color = "gold";
    jackpotDOM.innerText = `JACKPOT! YOU WON ${payout}!`;
  }

  await settle(payout);
  window.dispatchEvent(new Event("game:over"));

  window.dispatchEvent(new Event("balance:refresh"));

  return;
}
  if (!row) return;

  // Check if the row has vehicles (and if they are visible)
  if (row.type === "car" || row.type === "truck") {
    const playerBoundingBox = new THREE.Box3();
    playerBoundingBox.setFromObject(player);

    for(const {ref} of row.vehicles){
      if (!ref?.visible) return;  // Skip invisible vehicles

      const vehicleBoundingBox = new THREE.Box3();
      vehicleBoundingBox.setFromObject(ref);
      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        if (!resultDOM || !finalScoreDOM) return;

        settleRun();

        const idx = position.currentRow-1/* Math.max(0, Math.min(position.currentRow, multipliers.length - 1)) */;
        const multiplier = multipliers[idx];
        window.dispatchEvent(new Event("game:over"));
        resultDOM.style.visibility = "visible";
        finalScoreDOM.innerText = position.currentRow.toString();
        await settle(netResult(multiplier));
        window.dispatchEvent(new Event("balance:refresh"));
        console.log(position.currentRow)
        console.log("hit!");
        break;
      }
    };
  }
}