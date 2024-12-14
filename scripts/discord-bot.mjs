import { Client, GatewayIntentBits } from "discord.js"
import { PrismaClient } from "@prisma/client"
import json from "../users.json" assert { type: "json" };
const prisma = new PrismaClient()

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

console.log("Discord bot is starting...")
console.log("DISCORD_BOT_TOKEN:", process.env.DISCORD_BOT_TOKEN)

client.once("ready", () => {
  console.log("Discord bot is ready!")
  checkTasks()
  setInterval(checkTasks, 20000)
})

async function checkTasks() {
  const overdueTasks = await prisma.task.findMany({
    where: {
      completed: false,
      deadline: { lt: new Date() },
    },
    include: { assignees: true },
  });
  
  for (const task of overdueTasks) {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    if (channel.isTextBased()) {
      const users = task.assignees.map((assignee) => assignee.discordUsername);
      const userIds = users.map((username) => {
        const user = json.users.find((user) => user.discordUsername === username);
        return user.discordId;
      });

      const mentions = userIds.map((id) => `<@${id}>`).join(" ");
      let message
      switch (task.notificationCount) {
        case 0:
          message = `タスク ${task.title} の期限が過ぎています！担当者: ${mentions}`;
          break;
        case 1:
          message = `タスク ${task.title} の期限が過ぎています！早く対応してください！担当者: ${mentions}`;
          break;
        case 2:
          message = `タスク ${task.title} の期限が過ぎています！すぐに対応してください！担当者: ${mentions}`;
          break;
        case 3:
          message = `タスク ${task.title} の期限が過ぎています！いい加減にしないと解雇。担当者: ${mentions}`;
          break;
        case 4:
          message = `タスク ${task.title} の期限が過ぎています！忙しいんだねwじゃあしょうがないか🤣担当者: ${mentions}`;
          break;
        case 5:
          message = `タスク ${task.title} の期限が過ぎています！忙しいんだw？じゃあしょうがないね〜🤣でも、他人の時間を無駄にする天才には拍手喝采だわ👏✨担当者: ${mentions}`;
          break;
        case 6:
          message = `タスク ${task.title} の期限が過ぎています！忙しすぎてタスク忘れるプロなの？🤣プロ意識高すぎて逆に尊敬しちゃうわ〜✨担当者: ${mentions}`;
          break;
        case 7:
          message = `タスク ${task.title} の期限が過ぎています！あぁ、期限守らないのも個性だもんね！ユニークで素敵だわ〜🤣担当者: ${mentions}`;
          break;
        default:
          message = `タスク ${task.title} の期限が過ぎています！何をしているんですか！担当者: ${mentions}`;
          break;
      }

      await channel.send(message);

      await prisma.task.update({
        where: { id: task.id },
        data: { notificationCount: { increment: 1 } },
      });
    }
  }
}

client.login(process.env.DISCORD_BOT_TOKEN)