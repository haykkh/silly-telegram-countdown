import { Telegraf } from "telegraf";

class Bot {
  bot: Telegraf;

  constructor() {
    const token = Deno.env.get("BOT_TOKEN");

    if (!token) {
      throw new Error("BOT_TOKEN is required");
    }

    this.bot = new Telegraf(token);

    this.registerCountdown();

    this.bot.launch();

    Deno.addSignalListener("SIGINT", () => this.bot.stop("SIGINT"));
    Deno.addSignalListener("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  private registerCountdown = () => {
    this.bot.command(
      "countdown",
      async (ctx) => {
        const extra = ctx.message.text.split(" ").slice(1).join(" ");
        await ctx.reply(`countdown registered ${extra}`);
      },
    );
  };
}

export default Bot;
