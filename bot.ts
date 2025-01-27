import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
import * as chrono from "chrono-node";

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
          } // * we have a date
          else this.startCountdown({ ctx, end, originalArgs: args });
        }
      },
    );
  };

  private startCountdown = async (
    args: { ctx: Context; end: Temporal.Instant; originalArgs: string },
  ) => {
    const { ctx, end, originalArgs } = args;

    const firstDiff = this.getDifference(end);

    if (firstDiff.seconds < 0) {
      // * date in the past
      await this.sendSnarkyResponse({
        ctx,
        responseType: "dateInThePast",
      });
      return;
    } else {
      const registrationMsg = await ctx.reply(
        `countdown registered ${originalArgs} (${end})`,
      );

      const diffString = this.getDurationString(firstDiff);
      const msg = await ctx.reply(`${diffString} left`);
      this.bot.telegram.pinChatMessage(msg.chat.id, msg.message_id);

      const intervalId = setInterval(() => {
        const diff = this.getDifference(end);

        if (diff.seconds <= 0) {
          this.bot.telegram.editMessageText(
            msg.chat.id,
            msg.message_id,
            undefined,
            "countdown complete",
          );

          this.bot.telegram.sendMessage(msg.chat.id, "countdown complete", {
            reply_parameters: { message_id: registrationMsg.message_id },
          });

          this.bot.telegram.sendSticker(
            msg.chat.id,
            "CAACAgUAAxkBAAIBEmeXoMso2oQyDcOg7cYl4EJhoAuxAAK_BgACzMbiAl-TAWfX41r4NgQ",
          );

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
    }
  };

  private getDifference = (end: Temporal.Instant) => {
    const now = Temporal.Now.instant();

    return now.until(end);
  };

  private getDurationString = (duration: Temporal.Duration) => {
    const totalSeconds = duration.seconds;
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
  dateInThePast: [
    "bro how imma posed to countdown to the past",
  ],
} as const;

type SnarkyReponse = keyof typeof snarkyResponses;

export default Bot;
