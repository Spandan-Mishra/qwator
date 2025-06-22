import { prismaClient } from "@repo/database";

export const getNextTask = async (voterId: number) => {
    const task = await prismaClient.task.findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    voter_id: voterId
                }
            }
        },
        select: {
            id: true,
            title: true,
            amount: true,
            options: true
        }
    });
    return task;
}
