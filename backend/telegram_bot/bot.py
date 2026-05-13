import os
import logging
import httpx
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters


load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)

API_URL = os.getenv("BOTANIK_API_URL", "http://127.0.0.1:8000/chat")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return

    user_message = update.message.text
    telegram_id = str(update.message.from_user.id)
    conversation_id = str(update.effective_chat.id)

    await context.bot.send_chat_action(
        chat_id=update.effective_chat.id,
        action="typing"
    )

    payload = {
        "message": user_message,
        "mode": "customer",
        "channel": "telegram",
        "telegram_id": telegram_id,
        "conversation_id": conversation_id
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(API_URL, json=payload)
            response.raise_for_status()

            data = response.json()
            bot_reply = data.get("reply", "Yanıt alınamadı.")

            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=bot_reply
            )

    except Exception as e:
        logging.error(f"Telegram bot error: {e}")

        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="Şu anda sisteme ulaşılamıyor. Lütfen daha sonra tekrar deneyin."
        )


def main():
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")

    if not bot_token:
        raise ValueError("TELEGRAM_BOT_TOKEN .env dosyasında bulunamadı.")

    application = ApplicationBuilder().token(bot_token).build()

    application.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    )

    logging.info("Telegram bot çalışıyor...")
    application.run_polling()


if __name__ == "__main__":
    main()