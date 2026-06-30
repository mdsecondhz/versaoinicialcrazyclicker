import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, gameSavesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpsertGameSaveBody } from "@workspace/api-zod";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

router.get("/game/save", requireAuth, async (req: any, res) => {
  try {
    const [save] = await db
      .select()
      .from(gameSavesTable)
      .where(eq(gameSavesTable.clerkUserId, req.userId));

    if (!save) {
      return res.json({
        energy: 0,
        energyPerClick: 1,
        energyPerSecond: 0,
        upgradeCounts: {},
      });
    }

    return res.json({
      energy: parseFloat(save.energy),
      energyPerClick: parseFloat(save.energyPerClick),
      energyPerSecond: parseFloat(save.energyPerSecond),
      upgradeCounts: (save.upgradeCounts as Record<string, number>) ?? {},
    });
  } catch (err) {
    req.log.error(err, "Failed to load game save");
    return res.status(500).json({ error: "Failed to load save" });
  }
});

router.put("/game/save", requireAuth, async (req: any, res) => {
  try {
    const parsed = UpsertGameSaveBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid save data" });
    }

    const { energy, energyPerClick, energyPerSecond, upgradeCounts } = parsed.data;

    const [saved] = await db
      .insert(gameSavesTable)
      .values({
        clerkUserId: req.userId,
        energy: String(energy),
        energyPerClick: String(energyPerClick),
        energyPerSecond: String(energyPerSecond),
        upgradeCounts: upgradeCounts ?? {},
      })
      .onConflictDoUpdate({
        target: gameSavesTable.clerkUserId,
        set: {
          energy: String(energy),
          energyPerClick: String(energyPerClick),
          energyPerSecond: String(energyPerSecond),
          upgradeCounts: upgradeCounts ?? {},
          updatedAt: new Date(),
        },
      })
      .returning();

    return res.json({
      energy: parseFloat(saved.energy),
      energyPerClick: parseFloat(saved.energyPerClick),
      energyPerSecond: parseFloat(saved.energyPerSecond),
      upgradeCounts: (saved.upgradeCounts as Record<string, number>) ?? {},
    });
  } catch (err) {
    req.log.error(err, "Failed to save game");
    return res.status(500).json({ error: "Failed to save game" });
  }
});

export default router;
