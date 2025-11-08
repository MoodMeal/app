import { Prisma } from '@prisma/client';
import type { Dish } from "@prisma/client";
export declare function getAllDishes(): Promise<Prisma.DishGetPayload<object>[]>;
export declare function createDish(data: Prisma.DishCreateInput): Promise<Dish>;
export declare function deleteDish(dishId: number): Promise<void>;
//# sourceMappingURL=dishService.d.ts.map