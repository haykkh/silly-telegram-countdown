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
        const args = ctx.message.text.split(" ").slice(1);

        if (!args.length) {
          await ctx.replyWithMarkdownV2(`__${this.getSnarkyResponse()}__`);
        } else await ctx.reply(`countdown registered ${args}`);
      },
    );
  };

  private getSnarkyResponse = (): string =>
    snarkyResponses[Math.floor(Math.random() * snarkyResponses.length)];
}

const snarkyResponses = [
  "i can't count down to nothing bro",
  "i'm not a mind reader bro",
  "bro i'm not a fortune teller",
  "countdown to what bro",
  "whatever bro",
];

export default Bot;
