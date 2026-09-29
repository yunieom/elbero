import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  transitLineById,
  transitLines,
  type Station,
  type TransitLineId,
} from '@/entities/station';
import { colors, radius, spacing } from '@/shared/theme';

import { LineBadge } from './line-badge';

interface StationPickerModalProps {
  visible: boolean;
  title: string;
  stations: Station[];
  selectedStationId?: string;
  onClose: () => void;
  onSelect: (station: Station) => void;
}

type PickerMode = 'search' | 'map';

export function StationPickerModal({
  visible,
  title,
  stations,
  selectedStationId,
  onClose,
  onSelect,
}: StationPickerModalProps) {
  const [mode, setMode] = useState<PickerMode>('search');
  const [query, setQuery] = useState('');
  const [selectedLineId, setSelectedLineId] = useState<TransitLineId>('5');

  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setMode('search');
  }, [title, visible]);

  const linesByStationKey = useMemo(() => {
    const result = new Map<string, TransitLineId[]>();
    for (const station of stations) {
      const lineIds = result.get(station.stationKey) ?? [];
      if (!lineIds.includes(station.lineId)) lineIds.push(station.lineId);
      result.set(station.stationKey, lineIds);
    }
    return result;
  }, [stations]);

  const visibleStations = useMemo(() => {
    if (mode === 'map') {
      return stations.filter((station) => station.lineId === selectedLineId);
    }
    const normalizedQuery = query.trim().toLocaleLowerCase('ko');
    if (!normalizedQuery) return [];
    return stations.filter((station) =>
      `${station.stationName} ${station.lineName}`
        .toLocaleLowerCase('ko')
        .includes(normalizedQuery),
    );
  }, [mode, query, selectedLineId, stations]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>역과 노선을 함께 선택해요</Text>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="역 선택 닫기"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>

        <View accessibilityRole="tablist" style={styles.modeTabs}>
          <ModeTab
            label="검색"
            selected={mode === 'search'}
            onPress={() => setMode('search')}
          />
          <ModeTab
            label="노선도"
            selected={mode === 'map'}
            onPress={() => setMode('map')}
          />
        </View>

        {mode === 'search' ? (
          <TextInput
            accessibilityLabel="역명 또는 노선 검색"
            autoFocus
            onChangeText={setQuery}
            placeholder="역명을 입력하세요"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
        ) : (
          <FlatList
            horizontal
            contentContainerStyle={styles.lineTabs}
            data={transitLines}
            keyExtractor={(line) => line.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item.id === selectedLineId;
              return (
                <Pressable
                  accessibilityLabel={`${item.name} 노선 보기`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedLineId(item.id)}
                  style={[
                    styles.lineTab,
                    selected && { borderColor: item.color },
                  ]}
                >
                  <LineBadge lineId={item.id} compact />
                  <Text style={styles.lineTabName}>{item.name}</Text>
                </Pressable>
              );
            }}
          />
        )}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={visibleStations}
          keyExtractor={(station) => station.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {mode === 'search' && !query.trim()
                  ? '찾을 역 이름을 입력해 주세요.'
                  : '일치하는 역이 없습니다.'}
              </Text>
              <Text style={styles.emptyText}>
                1·2·3·5호선, 경의중앙선, 공항철도 역을 찾을 수 있어요.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const isSelected = item.id === selectedStationId;
            const transferLineIds = linesByStationKey.get(item.stationKey) ?? [
              item.lineId,
            ];
            return (
              <Pressable
                accessibilityLabel={`${item.stationName}, ${item.lineName}${item.journeySupported ? '' : ', 안전 경로 준비 중'}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  styles.stationRow,
                  isSelected && styles.selectedRow,
                  pressed && styles.pressedRow,
                ]}
              >
                {mode === 'map' ? (
                  <View style={styles.railArea}>
                    {index > 0 ? (
                      <View
                        style={[
                          styles.railTop,
                          {
                            backgroundColor: transitLineById[item.lineId].color,
                          },
                        ]}
                      />
                    ) : null}
                    <View
                      style={[
                        styles.railNode,
                        { borderColor: transitLineById[item.lineId].color },
                      ]}
                    />
                    {index < visibleStations.length - 1 ? (
                      <View
                        style={[
                          styles.railBottom,
                          {
                            backgroundColor: transitLineById[item.lineId].color,
                          },
                        ]}
                      />
                    ) : null}
                  </View>
                ) : (
                  <LineBadge lineId={item.lineId} />
                )}
                <View style={styles.stationTextArea}>
                  <Text style={styles.stationName}>{item.stationName}</Text>
                  {!item.journeySupported ? (
                    <Text style={styles.supportText}>안전 경로 준비 중</Text>
                  ) : null}
                </View>
                <View style={styles.transferBadges}>
                  {transferLineIds.map((lineId) => (
                    <LineBadge key={lineId} lineId={lineId} compact />
                  ))}
                </View>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

function ModeTab({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.modeTab, selected && styles.selectedModeTab]}
    >
      <Text
        style={[styles.modeTabText, selected && styles.selectedModeTabText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
  closeButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  closeButtonText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.xxs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  modeTab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  selectedModeTab: { backgroundColor: colors.surface },
  modeTabText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  selectedModeTabText: { color: colors.textPrimary },
  searchInput: {
    minHeight: 52,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 17,
    backgroundColor: colors.surfaceMuted,
  },
  lineTabs: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  lineTab: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  lineTabName: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  stationRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xs,
  },
  selectedRow: { backgroundColor: colors.primarySoft },
  pressedRow: { opacity: 0.7 },
  stationTextArea: { flex: 1 },
  stationName: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  supportText: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  transferBadges: { flexDirection: 'row', gap: 4 },
  railArea: {
    width: 28,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railTop: { position: 'absolute', top: 0, width: 4, height: 26 },
  railBottom: { position: 'absolute', bottom: 0, width: 4, height: 26 },
  railNode: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 5,
    backgroundColor: colors.surface,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
