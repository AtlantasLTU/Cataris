import type { Row } from "./types";
import * as THREE from "three";
import { generateRows } from "./generateRows";
import { Grass } from "./Grass";
import { Road } from "./Road";
import { Car } from "./Car";
import { Truck } from "./Truck";
import { StopBollard } from "./StopBollard";


export const metadata: Row[] = [];

export const updatedRows = new Set<number>();

export const map = new THREE.Group();

export const rowMeshes = new Map<number, THREE.Object3D>();


export function initializeMap() {
  // Remove all rows
  metadata.length = 0;
  updatedRows.clear();
  updatedRows.add(0);
  map.clear();
  rowMeshes.clear();
  const grass = Grass({rowIndex:0});
  map.add(grass);
  rowMeshes.set(0, grass);
  addRows();
}

export function addRows() {
  const newMetadata = generateRows(10);

  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;

    // You currently only render car/truck rows here
    if (rowData.type === "car" || rowData.type === "truck") {
      const row = Road(rowIndex);
      row.userData.rowIndex = rowIndex;
      row.name = `row-${rowIndex}`;

      rowData.vehicles.forEach((vehicle) => {
        const obj =
          rowData.type === "car"
            ? Car(vehicle.initialTileIndex, rowData.direction, vehicle.color)
            : Truck(vehicle.initialTileIndex, rowData.direction, vehicle.color);

        vehicle.ref = obj;
        row.add(obj);
      });

      map.add(row);
      rowMeshes.set(rowIndex, row);
    }
    const grass = Grass({rowIndex:11});
    map.add(grass);
    rowMeshes.set(11, grass);
  });
}

function hasVehicles(row: Row): row is (
  | { type: "car"; direction: boolean; speed: number; vehicles: { initialTileIndex: number; color: THREE.ColorRepresentation; ref?: THREE.Object3D }[] }
  | { type: "truck"; direction: boolean; speed: number; vehicles: { initialTileIndex: number; color: THREE.ColorRepresentation; ref?: THREE.Object3D }[] }
) {
  return row.type === "car" || row.type === "truck";
}

/* export function updateRow(rowIndex: number) {
  // Check if the row has already been updated
  if (updatedRows.has(rowIndex)) return;

  // Remove the old row if it exists
  const existingRow = map.children.find((child: any) => child.position.y === rowIndex * tileSize);
  if (existingRow) {
    map.remove(existingRow);  // Remove the existing row
  }
  // Check if the row has vehicles before attempting to access `vehicles`
  const row = metadata[rowIndex-1];
  if (hasVehicles(row)) {
  row.vehicles.forEach(vehicle => {
    if(vehicle.ref){
      map.remove(vehicle.ref);
      vehicle.ref = undefined;
      //console.log("removed!");
    }
  });
  }

  /* const road = map.getObjectByName("road");
    if (road) {
      const manholeCover = road.getObjectByName("manholeCover")
      if(manholeCover){
        const stripeMesh1 = manholeCover.getObjectByName("stripeMesh1")
        const stripeMesh2 = manholeCover.getObjectByName("stripeMesh2")
        const stripeMesh3 = manholeCover.getObjectByName("stripeMesh3")
        if(stripeMesh1 && stripeMesh2 && stripeMesh3){
          manholeCover.remove(stripeMesh1);
          manholeCover.remove(stripeMesh2);
          manholeCover.remove(stripeMesh3);
          console.log("stripeMeshes removed!");
        }
        console.log("manholeCover found!");
      };
    } 
  
  metadata[rowIndex-1].type = "stopBollard";
  // Create a new road row
  const newRow = Road(rowIndex);

  // Add stop bollard to the new row
  const stopBollard = StopBollard(rowIndex);
  stopBollard.position.set(-42, 0, 0); // Adjust position of stop bollard
  newRow.add(stopBollard)
  
  const manholeCover = ManholeCover();
  manholeCover.position.set(0, 0, 0);
  /* const stripeMesh1 = manholeCover.getObjectByName("stripeMesh1");
  if (stripeMesh1 && 'material' in stripeMesh1) {
    const material = stripeMesh1.material as THREE.Material;
    if ('color' in material) {
      (material as any).color.set(0x123123);
    }
  } 
  newRow.add(manholeCover);
  // Add the new row to the map
  map.add(newRow);

  const prevRow = map.children.find((child: any) => child.position.y === (rowIndex+2)*tileSize);
  if(prevRow){
    const road = map.getObjectByName("road");
    console.log("asd");
    if (road) {
      const manholeCover = road.getObjectByName("manholeCover")
      if(manholeCover){
        const stripeMesh1 = manholeCover.getObjectByName("stripeMesh1")
        const stripeMesh2 = manholeCover.getObjectByName("stripeMesh2")
        const stripeMesh3 = manholeCover.getObjectByName("stripeMesh3")
        if(stripeMesh1 && stripeMesh2 && stripeMesh3){
          manholeCover.remove(stripeMesh1);
          manholeCover.remove(stripeMesh2);
          manholeCover.remove(stripeMesh3);
          console.log("stripeMeshes removed!");
        }
        console.log("manholeCover found!");
      };
    }
  }

  // Mark this row as updated
  updatedRows.add(rowIndex);
} */

  export function updateRow(rowIndex: number) {
  if (updatedRows.has(rowIndex)) return;

  const metaIndex = rowIndex - 1;
  const oldRowMeta = metadata[metaIndex];

  // 1) Remove old row mesh (best option: remove whole row)
  const oldRowMesh = rowMeshes.get(rowIndex);
  if (oldRowMesh) {
    disposeObject(oldRowMesh);
    map.remove(oldRowMesh);
    rowMeshes.delete(rowIndex);
  }

  // 2) Clean refs in metadata (no scene removal needed if you removed the row mesh)
  if (hasVehicles(oldRowMeta)) {
    oldRowMeta.vehicles.forEach(v => (v.ref = undefined));
  }

  // 3) Replace metadata row with a clean stopBollard row object (no hybrid states)
  // Adjust shape to match your Row union:
  metadata[metaIndex] = { type: "stopBollard" };

  // 4) Build new row mesh
  const newRow = Road(rowIndex);
  newRow.userData.rowIndex = rowIndex;
  newRow.name = `row-${rowIndex}`;

  const stopBollard = StopBollard(rowIndex);
  stopBollard.position.set(-42, 0, 0);
  newRow.add(stopBollard);

  map.add(newRow);
  rowMeshes.set(rowIndex, newRow);

  // 5) Mark updated
  updatedRows.add(rowIndex);
  removeManholeStripes(rowIndex-1);
}

function removeManholeStripes(rowIndex: number) {
  if (rowIndex <= 0) return;
  const row = map.getObjectByName(`row-${rowIndex}`);  // Get the previous row from rowMeshes
  if (!row) {
    console.warn(`Row ${rowIndex} does not exist!`);
    return;
  }

  //console.log("Row children:", row.children);

  // Try to get the manhole cover object
  /* const road = row.getObjectByName("road");
  if(!road){
    console.warn(`Road not found in row ${rowIndex}`);
    return;
  } */
  const manholeCover = row.getObjectByName("manholeCover");
  if (!manholeCover) {
    //console.warn(`ManholeCover not found in row ${rowIndex}`);
    return;
  }
/*   manholeCover.traverse((child) => {
  //console.log(child.name, child);
}); */

  //console.log(`Removing stripes from ManholeCover in row ${rowIndex}`);
  //console.log("ManholeCover children before removal:", manholeCover.children);

  // Now safely remove the stripes
  ["stripeMesh1", "stripeMesh2", "stripeMesh3"].forEach((name) => {
    const stripe = manholeCover.getObjectByName(name);
    if (stripe) {
        //console.log(`Found ${name} in manholeCover`);
        disposeObject(stripe);
      stripe.parent?.remove(stripe);
      //console.log(`Removed ${name}`);
    } else {
      //console.warn(`${name} not found in ManholeCover of row ${rowIndex}`);
    }
  });

  ["stripeMesh1", "stripeMesh2", "stripeMesh3"].forEach((name) => {
    const stripe = manholeCover.getObjectByName(name);
    if (!stripe) {
  //console.log(`${name} successfully removed.`);
      //console.log(`Removed ${name}`);
    } else {
  //console.log(`${name} still exists.`);
    }
  });

  
}


function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return (obj as Partial<THREE.Mesh>).isMesh === true;
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (isMesh(child)) {
      child.geometry.dispose();

      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
