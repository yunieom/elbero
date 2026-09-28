import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Station } from '@/entities/station';
import { colors, radius, spacing } from '@/shared/theme';

interface StationPickerModalProps {
  visible: boolean;
  title: string;
  stations: Station[];
  selectedStationCode?: string;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onClose: () => void;
  onSelect: (station: Station) => void;
}

export function StationPickerModal({
  visible,
  title,
  stations,
  selectedStationCode,
  isLoading,
  errorMessage,
  onRetry,
  onClose,
  onSelect,
}: StationPickerModalProps) {
  const [query, setQuery] = useState('');
  const filteredStations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko');
    if (!normalizedQuery) return stations;
    return stations.filter((station) =>
      station.stationName.toLocaleLowerCase('ko').includes(normalizedQuery),
    );
  }, [query, stations]);

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
            <Text style={styles.eyebrow}>5호선</Text>
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

        <TextInput
          accessibilityLabel="역명 검색"
          autoFocus
          onChangeText={setQuery}
          placeholder="역명을 입력하세요"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>역 목록을 불러오는 중이에요.</Text>
          </View>
        ) : errorMessage ? (
          <View accessibilityLiveRegion="polite" style={styles.centerState}>
            <Text style={styles.errorTitle}>역 목록을 불러오지 못했어요.</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredStations}
            keyExtractor={(station) => station.stationCode}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>일치하는 5호선 역이 없습니다.</Text>
            }
            renderItem={({ item }) => {
              const isSelected = item.stationCode === selectedStationCode;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [
                    styles.stationRow,
                    isSelected && styles.selectedRow,
                    pressed && styles.pressedRow,
                  ]}
                >
                  <View style={styles.lineDot} />
                  <Text style={styles.stationName}>{item.stationName}</Text>
                  <Text style={styles.stationLine}>{item.lineName}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    color: colors.line5,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  closeButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
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
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  stationRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  selectedRow: {
    backgroundColor: colors.primarySoft,
  },
  pressedRow: {
    opacity: 0.7,
  },
  lineDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.line5,
  },
  stationName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  stationLine: {
    color: colors.textSecondary,
    fontSize: 13,
    marginRight: spacing.sm,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  stateText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  retryButton: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primarySoft,
  },
  retryButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
