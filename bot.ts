import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
import * as chrono from "chrono-node";
import { Markup } from "telegraf";
import { Message } from "../../Library/Caches/deno/npm/registry.npmjs.org/@telegraf/types/7.1.0/message.d.ts";

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
          const end = chrono.parseDate(args)?.toTemporalInstant();

          if (!end) {
            // * arg not a date
            await this.sendSnarkyResponse({
              ctx,
              responseType: "notUnderstood",
            });
          } // * yay we have a date
          else {
            const msg = await ctx.reply(`countdown registered ${end}`);
            this.bot.telegram.pinChatMessage(msg.chat.id, msg.message_id);

            this.startCountdown(msg, end);
          }
        }
      },
    );
  };

  private startCountdown = (msg: Message, end: Temporal.Instant) => {
    const intervalId = setInterval(() => {
      const diff = this.getDifference(end);

      if (diff.seconds <= 0) {
        clearInterval(intervalId);
        return;
      }

      const diffString = this.getDurationString(diff);

      this.bot.telegram.editMessageText(
        msg.chat.id,
        msg.message_id,
        undefined,
        `${diffString} left`,
      );
    }, 1000);
  };

  private getDifference = (end: Temporal.Instant) => {
    const now = Temporal.Now.instant();

    return now.until(end);
  };

  private getDurationString = (duration: Temporal.Duration) => {
    const totalSeconds = duration.total("seconds");
    const years = Math.floor(totalSeconds / (365 * 24 * 60 * 60));
    const months = Math.floor(
      (totalSeconds % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60),
    );
    const weeks = Math.floor(
      (totalSeconds % (30 * 24 * 60 * 60)) / (7 * 24 * 60 * 60),
    );
    const days = Math.floor(
      (totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60),
    );
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const strings = [
      years ? `${years} yirs` : "",
      months ? `${months} munths` : "",
      weeks ? `${weeks} wiks` : "",
      days ? `${days} deys` : "",
      hours ? `${hours} hers` : "",
      minutes ? `${minutes} mers` : "",
      seconds ? `${seconds} sers` : "",
    ];

    return strings.join(" ");
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
