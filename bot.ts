import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
import * as chrono from "chrono-node";
import { Markup } from "telegraf";

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
        const args = ctx.message.text.split(" ").slice(1).join(" ");

        if (!args.length) {
          // * no args
          this.sendSnarkyResponse({ ctx, responseType: "noArgs" });
        } else {
          const date = chrono.parseDate(args);

          if (!date) {
            // * arg not a date
            await this.sendSnarkyResponse({
              ctx,
              responseType: "notUnderstood",
            });
          } // * yay we have a date
          else await ctx.reply(`countdown registered ${date}`);
        }
      },
    );
  };

  private sendSnarkyResponse = async (
    args: { ctx: Context; responseType: SnarkyReponse },
  ) => {
    const { ctx, responseType } = args;

    const snark = snarkyResponses[responseType][
      Math.floor(Math.random() * snarkyResponses[responseType].length)
    ];

    return await ctx.replyWithMarkdownV2(`__${snark}__`);
  };
}

const snarkyResponses = {
  noArgs: [
    "i can't count down to nothing bro",
    "i'm not a mind reader bro",
    "bro i'm not a fortune teller",
    "countdown to what bro",
    "whatever bro",
  ],
  notUnderstood: [
    "has to be a date bro",
    "i need a date bro",
    "it says countdown bro",
    "SOMETHING TEMPORAL DUDE",
    "DATE TIME DATE TIME DATE TIME",
  ],
} as const;

type SnarkyReponse = keyof typeof snarkyResponses;

export default Bot;
