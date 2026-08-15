import * as THREE from "three";
import { endsUpInValidPosition } from "./endsUpInValidPosition";
import { metadata as rows} from "./Map";
import type { MoveDirection } from "./types";
import { updateRow, updatedRows} from "./Map";
import {hitTest} from "./hitTest";

interface CatGlobal {
  __CAT_PLAYER__?: THREE.Group;
}

const g = globalThis as unknown as CatGlobal;

export const player: THREE.Group = g.__CAT_PLAYER__ ?? (g.__CAT_PLAYER__ = Player());


function Player() {
  const player = new THREE.Group();

  // Body of the player (cat) - Let's make it more streamlined like a cat's body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4, 16, 6), // Width, depth, height
    new THREE.MeshLambertMaterial({
      color: 0xfae3bb, // Change the color to represent the cat's fur
      flatShading: true,
    })
  );
  body.castShadow = true;
  body.receiveShadow = true;
  body.position.z = 10; // Slightly raised to represent the height of the body
  player.add(body);

  // Head of the player (cat)
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(5, 5, 4), // Width, height, depth
    new THREE.MeshLambertMaterial({
      color: 0xfae3bb, // A different color for the head
      flatShading: true,
    })
  );
  head.position.z = 12; // Position the head on top of the body
  head.position.y = 10.5;
  head.castShadow = true;
  head.receiveShadow = true;
  player.add(head);

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1, 2), // Width, height, depth
    new THREE.MeshLambertMaterial({
      color: 0xfae3bb, // A different color for the head
      flatShading: true,
    })
  );
  nose.position.z = 11; // Position the head on top of the body
  nose.position.y = 13.5;
  nose.castShadow = true;
  nose.receiveShadow = true;
  player.add(nose);

  const noseTip = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1, 1), // Width, height, depth
    new THREE.MeshLambertMaterial({
      color: 0xf18a8b, // A different color for the head
      flatShading: true,
    })
  );
  noseTip.position.z = 12; // Position the head on top of the body
  noseTip.position.y = 13.5;
  noseTip.castShadow = true;
  noseTip.receiveShadow = true;
  player.add(noseTip);

  const ear = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1), // Width, height, depth
    new THREE.MeshLambertMaterial({
      color: 0xfaa498, // A different color for the head
      flatShading: true,
    })
  );
  ear.position.z = 14.5; // Position the head on top of the body
  ear.position.y = 9;
  ear.position.x = 1.5;
  ear.castShadow = true;
  ear.receiveShadow = true;
  player.add(ear);

  const ear1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1), // Width, height, depth
    new THREE.MeshLambertMaterial({
      color: 0xfaa498, // A different color for the head
      flatShading: true,
    })
  );
  ear1.position.z = 14.5; // Position the head on top of the body
  ear1.position.y = 9;
  ear1.position.x = -1.5;
  ear1.castShadow = true;
  ear1.receiveShadow = true;
  player.add(ear1);

  // Tail of the player (cat) to add some extra detail
  const tail1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 2.5), // Radius, radius, height, radialSegments
    new THREE.MeshLambertMaterial({
      color: 0xfae4bc, // Tail color
      flatShading: true,
    })
  );
  tail1.rotation.x = -Math.PI / 2.5; // Rotate the tail to extend from the back
  //tail.rotation.y = Math.PI / 4;
  tail1.position.set(0, -8.3, 10); // Attach to the back of the body
  tail1.castShadow = true;
  tail1.receiveShadow = true;
  player.add(tail1);

    const tail2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 4), // Radius, radius, height, radialSegments
    new THREE.MeshLambertMaterial({
      color: 0xfae4bc, // Tail color
      flatShading: true,
    })
  );
  tail2.rotation.x = Math.PI / 3.5; // Rotate the tail to extend from the back
  //tail.rotation.y = Math.PI / 4;
  tail2.position.set(0, -10.5, 10.75); // Attach to the back of the body
  tail2.castShadow = true;
  tail2.receiveShadow = true;
  player.add(tail2);

  const hLeg = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 6), // Radius, radius, height, radialSegments
    new THREE.MeshLambertMaterial({
      color: 0xfae3bb, // Tail color
      flatShading: true,
    })
  );
  hLeg.position.set(1.1, -6.5, 6); // Attach to the back of the body
  hLeg.castShadow = true;
  hLeg.receiveShadow = true;
  player.add(hLeg);

  const hLeg2 = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 6), // Radius, radius, height, radialSegments
    new THREE.MeshLambertMaterial({
      color: 0xfae3bb, // Tail color
      flatShading: true,
    })
  );
  hLeg2.position.set(-1.1, -6.5, 6);
  hLeg2.castShadow = true;
  hLeg2.receiveShadow = true;
  player.add(hLeg2);

  const fLeg = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 10.1), // Radius, radius, height, radialSegments
    new THREE.MeshLambertMaterial({
      color: 0xfae3bb, // Tail color
      flatShading: true,
    })
  );
  fLeg.position.set(1.1, 6, 8.05); // Attach to the back of the body
  fLeg.castShadow = true;
  fLeg.receiveShadow = true;
  player.add(fLeg);

  const fLeg1 = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 10.1), // Radius, radius, height, radialSegments
    new THREE.MeshLambertMaterial({
      color: 0xfae3bb, // Tail color
      flatShading: true,
    })
  );
  fLeg1.position.set(-1.1, 6, 8.05); // Attach to the back of the body
  fLeg1.castShadow = true;
  fLeg1.receiveShadow = true;
  player.add(fLeg1);

  // Create a container for the player that will move along the Y-axis
  const playerContainer = new THREE.Group();
  playerContainer.add(player);
  return playerContainer;
}

export const position: {
  currentRow: number;
  currentTile: number;
} = {
  currentRow: 0,
  currentTile: 0,
};

export const movesQueue: MoveDirection[] = [];

export function initializePlayer() {
  // Initialize the Three.js player object
  player.position.x = 0;
  player.position.y = 0;
  player.children[0].position.z = 0;

  // Initialize metadata
  position.currentRow = 0;
  position.currentTile = 0;

  // Clear the moves queue
  movesQueue.length = 0;
}

export function queueMove(direction: MoveDirection) {
  const isValidMove = endsUpInValidPosition(
    {
      rowIndex: position.currentRow,
      tileIndex: position.currentTile,
    },
    [...movesQueue, direction]
  );

  if (!isValidMove) return;

  movesQueue.push(direction);
}

export function stepCompleted() {
  const direction = movesQueue.shift();

  if (direction === "forward") position.currentRow += 1;
//  if (direction === "backward") position.currentRow -= 1;
/*   if (direction === "left") position.currentTile -= 1;
  if (direction === "right") position.currentTile += 1; */
  void hitTest();

/*   // Add new rows if the player is running out of them
  if (position.currentRow > rows.length - 10) addRows(); */

  const scoreDOM = document.getElementById("score");
  if (!scoreDOM) return;
  
  const score = Number(scoreDOM.innerText) || 0;
  
  if (position.currentRow > score) {
    scoreDOM.innerText = position.currentRow.toString();
  }
  if(position.currentRow<11){
    let currentRowData;
    if(position.currentRow===10){
      currentRowData = rows[position.currentRow-1];
    } else {
      currentRowData = rows[position.currentRow];
    }
    if (
      (currentRowData.type === "car" || currentRowData.type === "truck") &&
      !updatedRows.has(position.currentRow)
    ) {
      updateRow( position.currentRow);
    }
  }
}