import { z } from 'zod';

export const purchaseItemSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required.'),
  // Note: Cost is purposefully ignored or validated server-side from catalog to prevent client spoofing
});

export const toggleEquipSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required.'),
});

export type PurchaseItemDto = z.infer<typeof purchaseItemSchema>;
export type ToggleEquipDto = z.infer<typeof toggleEquipSchema>;
