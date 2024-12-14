import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import json from "../users.json" assert { type: "json" };

for (const user of json.users) {
    await prisma.user.create({
        data: user
    });
}