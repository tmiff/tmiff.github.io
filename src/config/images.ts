import records from "./image-slots.json";
import type { ImageSlotRecord } from "../types";

const slots = records as ImageSlotRecord[];

export function getImageSlot(id: string) {
  const slot = slots.find((item) => item.id === id);
  if (!slot) {
    throw new Error(`Unknown image slot: ${id}`);
  }
  return slot;
}

export { slots as imageSlots };
