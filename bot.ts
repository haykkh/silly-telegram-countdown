import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

class Bot {
  bot: Telegraf;

  constructor() {
    const token = Deno.env.get("BOT_TOKEN");

    if (!token) {
      throw new Error("BOT_TOKEN is required");
    }

    this.bot = new Telegraf(token);

    this.bot.start((ctx) => ctx.reply("Welcome"));
    this.bot.help((ctx) => ctx.reply("Send me a sticker"));
    this.bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
    this.bot.hears("hi", (ctx) => ctx.reply("hey there"));
    this.bot.launch();

    Deno.addSignalListener("SIGINT", () => this.bot.stop("SIGINT"));
    Deno.addSignalListener("SIGTERM", () => this.bot.stop("SIGTERM"));
  }
}

export default Bot;
