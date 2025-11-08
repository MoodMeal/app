import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();
export async function getAllDishes() {
    return prisma.dish.findMany();
}
export async function createDish(data) {
    return prisma.dish.create({ data });
}
export async function deleteDish(dishId) {
    await prisma.$transaction([
        prisma.recommendation.deleteMany({
            where: { dishId }
        }),
        prisma.dish.delete({
            where: { id: dishId }
        })
    ]);
}
//# sourceMappingURL=dishService.js.map