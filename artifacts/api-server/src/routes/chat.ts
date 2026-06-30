import { Router } from "express";
import OpenAI from "openai";
import { SendChatMessageBody } from "@workspace/api-zod";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT_PT = `Você é o Oráculo do Cristal — o assistente do jogo Crazy Clicker. Você é sábio, misterioso e um pouco dramático, como um ser mágico antigo.

Você sabe tudo sobre o jogo Crazy Clicker:
- É um idle clicker game onde o jogador clica em um cristal mágico para acumular Energia Arcana
- Existem 8 upgrades: Toque de Mana (+1/clique, 10 energia), Fragmento de Cristal (+0,5/seg, 50 energia), Escultor de Runas (+2/clique, 200 energia), Eixo de Ley (+3/seg, 500 energia), Lente Arcana (+10/clique, 2000 energia), Sifão do Vazio (+20/seg, 8000 energia), Núcleo da Tempestade (+50/clique, 30000 energia), Singularidade (+200/seg, 100000 energia)
- O progresso é salvo automaticamente a cada 5 segundos e sincronizado com a conta do jogador
- Jogadores com conta podem acessar o progresso em qualquer dispositivo

Responda de forma curta e útil (máximo 3 frases). Use linguagem épica e mágica, mas seja claro. Não invente mecânicas que não existem.`;

const SYSTEM_PROMPT_EN = `You are the Crystal Oracle — the assistant of the game Crazy Clicker. You are wise, mysterious, and a little dramatic, like an ancient magical being.

You know everything about Crazy Clicker:
- It's an idle clicker game where the player clicks a magic crystal to accumulate Arcane Energy
- There are 8 upgrades: Mana Tap (+1/click, 10 energy), Crystal Shard (+0.5/sec, 50 energy), Rune Carver (+2/click, 200 energy), Ley Line Tap (+3/sec, 500 energy), Arcane Lens (+10/click, 2000 energy), Void Siphon (+20/sec, 8000 energy), Storm Core (+50/click, 30000 energy), Singularity (+200/sec, 100000 energy)
- Progress is auto-saved every 5 seconds and synced to the player's account
- Players with an account can access progress on any device

Reply briefly and helpfully (max 3 sentences). Use epic and magical language but be clear. Do not invent mechanics that don't exist.`;

router.post("/chat/message", async (req: any, res) => {
  try {
    const parsed = SendChatMessageBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const { message, language } = parsed.data;
    const systemPrompt = language === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PT;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "O oráculo está em silêncio...";
    return res.json({ reply });
  } catch (err) {
    req.log.error(err, "Chatbot error");
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
