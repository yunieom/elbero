import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const staticOnly = process.argv.includes("--static");
const root = resolve(import.meta.dirname, "../..");
const appConfig = JSON.parse(
  await readFile(resolve(root, "apps/mobile/app.json"), "utf8"),
).expo;
const easConfig = JSON.parse(
  await readFile(resolve(root, "apps/mobile/eas.json"), "utf8"),
);
const mobilePackage = JSON.parse(
  await readFile(resolve(root, "apps/mobile/package.json"), "utf8"),
);

const checks = [];
const check = (name, passed, detail) => checks.push({ name, passed, detail });

check("앱 버전", /^\d+\.\d+\.\d+$/.test(appConfig.version), appConfig.version);
check(
  "iOS 식별자·빌드 번호",
  Boolean(appConfig.ios?.bundleIdentifier && appConfig.ios?.buildNumber),
  `${appConfig.ios?.bundleIdentifier ?? "없음"} (${appConfig.ios?.buildNumber ?? "없음"})`,
);
check(
  "Android 식별자·버전 코드",
  Boolean(appConfig.android?.package && appConfig.android?.versionCode > 0),
  `${appConfig.android?.package ?? "없음"} (${appConfig.android?.versionCode ?? "없음"})`,
);
check(
  "검증된 기기 범위",
  appConfig.ios?.supportsTablet === false,
  appConfig.ios?.supportsTablet === false
    ? "iPhone 전용으로 제한"
    : "iPad 스크린샷·QA 필요",
);
check(
  "EAS production 프로필",
  easConfig.build?.production?.android?.buildType === "app-bundle" &&
    easConfig.build?.production?.environment === "production",
  "Android AAB · production 환경",
);
check(
  "iOS Privacy Manifest",
  appConfig.ios?.privacyManifests?.NSPrivacyTracking === false &&
    Array.isArray(appConfig.ios?.privacyManifests?.NSPrivacyCollectedDataTypes) &&
    appConfig.ios.privacyManifests.NSPrivacyCollectedDataTypes.length === 0 &&
    appConfig.ios?.privacyManifests?.NSPrivacyAccessedAPITypes?.length > 0,
  "추적 없음 · 수집 유형 없음 · 필수 API 사유 포함",
);

const requiredBlockedPermissions = [
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.CAMERA",
  "android.permission.READ_CONTACTS",
  "android.permission.RECORD_AUDIO",
  "com.google.android.gms.permission.AD_ID",
];
const blockedPermissions = new Set(appConfig.android?.blockedPermissions ?? []);
const missingBlockedPermissions = requiredBlockedPermissions.filter(
  (permission) => !blockedPermissions.has(permission),
);
check(
  "민감 Android 권한 차단",
  missingBlockedPermissions.length === 0,
  missingBlockedPermissions.length === 0
    ? "위치·카메라·마이크·연락처·광고 ID 차단"
    : `누락: ${missingBlockedPermissions.join(", ")}`,
);

const directRuntimeDependencies = Object.keys(mobilePackage.dependencies ?? {});
const dataCollectionDependencies = directRuntimeDependencies.filter((name) =>
  /(analytics|advert|facebook|firebase|sentry|segment|amplitude|mixpanel)/i.test(
    name,
  ),
);
check(
  "광고·분석 SDK",
  dataCollectionDependencies.length === 0,
  dataCollectionDependencies.length === 0
    ? "직접 의존성 없음"
    : dataCollectionDependencies.join(", "),
);

const qaRoute = await readFile(
  resolve(root, "apps/mobile/app/qa/states.tsx"),
  "utf8",
);
check(
  "프로덕션 QA 화면 차단",
  qaRoute.includes("!__DEV__") && qaRoute.includes("<Redirect"),
  "개발 빌드에서만 접근",
);

const requiredDocs = [
  "docs/release/t23-launch-gate.md",
  "docs/release/t24-store-listing.md",
  "docs/release/privacy-policy.md",
  "docs/release/terms-of-service.md",
  "docs/release/support.md",
  "docs/release/t25-release-runbook.md",
];
for (const path of requiredDocs) {
  try {
    await readFile(resolve(root, path), "utf8");
    check(`문서 ${path}`, true, "있음");
  } catch {
    check(`문서 ${path}`, false, "없음");
  }
}

const trackedFiles = execFileSync("git", ["ls-files"], {
  cwd: root,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);
const forbiddenTrackedFiles = trackedFiles.filter(
  (path) =>
    (/(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith(".example")) ||
    /\.(?:jks|p8|p12|mobileprovision)$/i.test(path),
);
check(
  "비밀 파일 Git 추적",
  forbiddenTrackedFiles.length === 0,
  forbiddenTrackedFiles.length === 0
    ? "발견되지 않음"
    : forbiddenTrackedFiles.join(", "),
);

if (!staticOnly) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
  const reportEmail = process.env.EXPO_PUBLIC_REPORT_EMAIL?.trim() ?? "";
  const operatorName = process.env.EXPO_PUBLIC_OPERATOR_NAME?.trim() ?? "";
  const publicUrls = [
    ["개인정보 처리방침 URL", process.env.EXPO_PUBLIC_PRIVACY_URL?.trim() ?? ""],
    ["이용약관 URL", process.env.EXPO_PUBLIC_TERMS_URL?.trim() ?? ""],
    ["지원 URL", process.env.EXPO_PUBLIC_SUPPORT_URL?.trim() ?? ""],
  ];
  check(
    "운영 API URL",
    /^https:\/\//.test(apiUrl) && !/(localhost|127\.0\.0\.1)/.test(apiUrl),
    apiUrl || "미설정",
  );
  check(
    "오류 제보 수신 주소",
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail),
    reportEmail ? "설정됨" : "미설정",
  );
  check(
    "운영자명",
    operatorName.length >= 2,
    operatorName || "미설정",
  );
  for (const [name, url] of publicUrls) {
    check(
      name,
      isPublicHttpsUrl(url),
      url || "미설정",
    );
  }
}

for (const item of checks) {
  console.log(
    `${item.passed ? "PASS" : "BLOCK"} · ${item.name} · ${item.detail}`,
  );
}

const blocked = checks.filter((item) => !item.passed);
console.log(
  `\n출시 검사: ${checks.length - blocked.length}/${checks.length} 통과`,
);
if (blocked.length > 0) process.exitCode = 1;

function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1" &&
      !/^192\.168\./.test(url.hostname) &&
      !/^10\./.test(url.hostname) &&
      !/^172\.(1[6-9]|2\d|3[01])\./.test(url.hostname)
    );
  } catch {
    return false;
  }
}
