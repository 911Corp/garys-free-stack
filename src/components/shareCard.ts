import { byId, ROLE_META } from '../core/catalog';
import type { Stack } from '../core/stack';
import type { Role } from '../core/schema';

/** Draws a 1200x630 PNG summary of a stack. Pure canvas, no external assets. */
export async function stackCardPng(stack: Stack, totalUsd: number, complete: boolean): Promise<Blob | null> {
  const c = document.createElement('canvas');
  c.width = 1200; c.height = 630;
  const g = c.getContext('2d');
  if (!g) return null;
  const mono = 'ui-monospace, Menlo, Consolas, monospace';
  g.fillStyle = '#0d0e0b'; g.fillRect(0, 0, 1200, 630);
  g.strokeStyle = '#1b1e16';
  for (let x = 0; x < 1200; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 630); g.stroke(); }
  for (let y = 0; y < 630; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(1200, y); g.stroke(); }
  g.fillStyle = '#c8f03c'; g.fillRect(60, 56, 92, 50);
  g.fillStyle = '#10130a'; g.font = `800 34px ${mono}`; g.fillText('$0', 80, 93);
  g.fillStyle = '#ebe7d8'; g.font = `700 30px ${mono}`; g.fillText("gary's free stack", 172, 92);
  g.font = `800 52px ${mono}`; g.fillText(stack.name.slice(0, 32), 60, 190);
  g.font = `22px ${mono}`;
  let y = 250;
  const entries = (Object.entries(stack.slots) as [Role, string[]][]).filter(([, l]) => l?.length);
  for (const [role, ids] of entries.slice(0, 7)) {
    g.fillStyle = '#858270'; g.fillText(ROLE_META[role].label.toLowerCase().padEnd(14, ' '), 60, y);
    g.fillStyle = '#ebe7d8'; g.fillText(ids.map((i) => byId.get(i)?.name ?? i).join(' + ').slice(0, 58), 290, y);
    y += 38;
  }
  if (entries.length > 7) { g.fillStyle = '#858270'; g.fillText(`+ ${entries.length - 7} more slots`, 60, y); }
  g.fillStyle = '#efe9d6'; g.fillRect(860, 450, 280, 120);
  g.fillStyle = '#1d1b14'; g.font = `700 20px ${mono}`; g.fillText('MONTHLY ESTIMATE', 880, 485);
  g.font = `800 48px ${mono}`; g.fillText(`$${totalUsd.toFixed(2)}${complete ? '' : '+'}`, 880, 545);
  g.fillStyle = '#c8f03c'; g.font = `20px ${mono}`; g.fillText('ship more. spend less. · @Gary_NGMI', 60, 590);
  return new Promise((res) => c.toBlob(res, 'image/png'));
}
