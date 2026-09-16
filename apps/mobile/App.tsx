import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.eyebrow}>
          엘베로
        </Text>
        <Text style={styles.title}>엘리베이터를 반영한{`\n`}지하철 경로 안내</Text>
        <Text style={styles.description}>
          운행 가능한 엘리베이터를 기준으로 출발부터 도착까지 안내해요.
        </Text>

        <View style={styles.form}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="출발역 선택"
            style={({ pressed }) => [styles.field, pressed && styles.pressed]}
          >
            <Text style={styles.fieldLabel}>출발역</Text>
            <Text style={styles.fieldValue}>역을 선택해 주세요</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="도착역 선택"
            style={({ pressed }) => [styles.field, pressed && styles.pressed]}
          >
            <Text style={styles.fieldLabel}>도착역</Text>
            <Text style={styles.fieldValue}>역을 선택해 주세요</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>경로 찾기</Text>
        </Pressable>

        <Text style={styles.notice}>
          엘리베이터 운행 정보의 출처와 확인 시각을 경로와 함께 표시합니다.
        </Text>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  eyebrow: {
    color: '#2457D6',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 40,
  },
  description: {
    color: '#526077',
    fontSize: 17,
    lineHeight: 26,
    marginTop: 16,
  },
  form: {
    gap: 12,
    marginTop: 40,
  },
  field: {
    minHeight: 76,
    borderColor: '#D8DFEA',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  pressed: {
    backgroundColor: '#EEF3FF',
  },
  fieldLabel: {
    color: '#526077',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldValue: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#B8C3D8',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  notice: {
    color: '#69778F',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 20,
  },
});
