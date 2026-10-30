import assert from 'node:assert/strict';
import test from 'node:test';

import { transitLines } from '../../entities/station/transit-lines.ts';
import { colors } from './colors.ts';
import { readableTextColor } from './contrast.ts';

test('기본 텍스트와 버튼은 WCAG AA 일반 텍스트 대비를 충족한다', () => {
  for (const [foreground, background] of [
    [colors.textPrimary, colors.background],
    [colors.textSecondary, colors.background],
    [colors.textMuted, colors.background],
    [colors.primary, colors.background],
    [colors.white, colors.primary],
    [colors.success, colors.successSoft],
    [colors.warning, colors.warningSoft],
    [colors.danger, colors.dangerSoft],
    [colors.unknown, colors.unknownSoft],
  ]) {
    assert.ok(contrastRatio(foreground, background) >= 4.5);
  }
});

test('모든 노선 배지는 배경에 맞는 읽기 가능한 글자색을 사용한다', () => {
  for (const line of transitLines) {
    const foreground = readableTextColor(line.color);
    assert.ok(
      contrastRatio(foreground, line.color) >= 4.5,
      `${line.name} 배지 대비가 부족합니다.`,
    );
  }
});

function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16),
  );
  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
