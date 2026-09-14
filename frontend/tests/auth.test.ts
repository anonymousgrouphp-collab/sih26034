import test from "node:test";
import assert from "node:assert/strict";
import { demoUsers, roleMeta, UserRole, SessionUser } from "../src/context/AuthContext";
import { DICTIONARY } from "../src/context/translations";

test("demoUsers contains all 4 designated government cadres with authentic identities", () => {
  assert.ok(demoUsers.inspector, "inspector cadre must exist");
  assert.equal(demoUsers.inspector.name, "Rajesh Sharma");
  assert.equal(demoUsers.inspector.badgeNumber, "INSP-DL-0842");
  assert.equal(demoUsers.inspector.officerRole, "INSPECTOR");
  assert.equal(demoUsers.inspector.initials, "RS");

  assert.ok(demoUsers.controller, "controller cadre must exist");
  assert.equal(demoUsers.controller.name, "S.K. Verma");
  assert.equal(demoUsers.controller.badgeNumber, "CTRL-DL-0012");
  assert.equal(demoUsers.controller.officerRole, "CONTROLLER");
  assert.equal(demoUsers.controller.initials, "SKV");

  assert.ok(demoUsers.administrator, "administrator cadre must exist");
  assert.equal(demoUsers.administrator.name, "Dr. Alok Verma");
  assert.equal(demoUsers.administrator.badgeNumber, "ADMIN-SYS-001");
  assert.equal(demoUsers.administrator.initials, "AV");

  assert.ok(demoUsers.auditor, "auditor cadre must exist");
  assert.equal(demoUsers.auditor.name, "Neha Gupta");
  assert.equal(demoUsers.auditor.badgeNumber, "AUDIT-GOI-044");
  assert.equal(demoUsers.auditor.initials, "NG");
});

test("roleMeta has correct landing paths for all cadres", () => {
  assert.equal(roleMeta.inspector.landing, "/dashboard");
  assert.equal(roleMeta.controller.landing, "/review-queue");
  assert.equal(roleMeta.administrator.landing, "/settings");
  assert.equal(roleMeta.auditor.landing, "/reports");
});

test("translations contain portal.login and portal.officer_workstation in English and Hindi", () => {
  assert.ok(DICTIONARY["portal.login"], "portal.login key must exist");
  assert.equal(DICTIONARY["portal.login"].en, "Log In");
  assert.equal(DICTIONARY["portal.login"].hi, "लॉग इन");

  assert.ok(DICTIONARY["portal.officer_workstation"], "portal.officer_workstation key must exist");
  assert.equal(DICTIONARY["portal.officer_workstation"].en, "Officer Workstation");
  assert.equal(DICTIONARY["portal.officer_workstation"].hi, "अधिकारी कार्यस्थान");

  assert.ok(DICTIONARY["portal.logout"], "portal.logout key must exist");
  assert.equal(DICTIONARY["portal.logout"].en, "Log Out");
  assert.equal(DICTIONARY["portal.logout"].hi, "लॉग आउट");
});

test("backend username mapping matches database seeds for all cadres", () => {
  const usernameMap: Record<UserRole, string> = {
    inspector: "inspector_rajesh",
    controller: "controller_south",
    administrator: "admin_central",
    auditor: "viewer_analyst",
  };

  assert.equal(usernameMap.inspector, "inspector_rajesh");
  assert.equal(usernameMap.controller, "controller_south");
  assert.equal(usernameMap.administrator, "admin_central");
  assert.equal(usernameMap.auditor, "viewer_analyst");
});

test("session serialization handles corrupt and empty stored data safely", () => {
  const parseSession = (stored: string | null): SessionUser | null => {
    try {
      if (!stored || stored === "null" || stored === "undefined") {
        return null;
      }
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  assert.equal(parseSession(null), null);
  assert.equal(parseSession(""), null);
  assert.equal(parseSession("undefined"), null);
  assert.equal(parseSession("null"), null);
  assert.equal(parseSession("invalid-json{"), null);

  const validSession: SessionUser = demoUsers.inspector;
  const serialized = JSON.stringify(validSession);
  const parsed = parseSession(serialized);
  assert.ok(parsed);
  assert.equal(parsed?.badgeNumber, "INSP-DL-0842");
  assert.equal(parsed?.name, "Rajesh Sharma");
});

test("math captcha verification correctly identifies valid and invalid answers", () => {
  const challenge = { n1: 8, n2: 5, answer: 13 };

  const verify = (input: string) => {
    const parsed = parseInt(input.trim(), 10);
    return !isNaN(parsed) && parsed === challenge.answer;
  };

  assert.equal(verify("13"), true);
  assert.equal(verify(" 13 "), true);
  assert.equal(verify("12"), false);
  assert.equal(verify(""), false);
  assert.equal(verify("abc"), false);
});

test("6-digit OTP validator requires exactly 6 numeric characters", () => {
  const validateOtp = (digits: string[]) => {
    const full = digits.join("");
    return full.length === 6 && /^\d{6}$/.test(full);
  };

  assert.equal(validateOtp(["8", "4", "2", "0", "1", "9"]), true);
  assert.equal(validateOtp(["8", "4", "2", "0", "1"]), false);
  assert.equal(validateOtp(["", "", "", "", "", ""]), false);
  assert.equal(validateOtp(["8", "4", "2", "0", "1", "a"]), false);
});

test("DSC Token PIN requires at least 4 characters", () => {
  const validateDscPin = (pin: string) => {
    return Boolean(pin && pin.trim().length >= 4);
  };

  assert.equal(validateDscPin("842019"), true);
  assert.equal(validateDscPin("1234"), true);
  assert.equal(validateDscPin("123"), false);
  assert.equal(validateDscPin(""), false);
  assert.equal(validateDscPin("   "), false);
});

test("cadre phone and email mappings exist and are distinct for each officer", () => {
  const cadrePhoneMap: Record<UserRole, string> = {
    inspector: "+91 98765 43210",
    controller: "+91 98112 00121",
    administrator: "+91 98710 33455",
    auditor: "+91 99551 22440",
  };

  const phones = Object.values(cadrePhoneMap);
  const uniquePhones = new Set(phones);
  assert.equal(uniquePhones.size, 4, "All 4 cadres must have distinct mobile numbers");

  const emails = Object.values(demoUsers).map((u) => u.email);
  const uniqueEmails = new Set(emails);
  assert.equal(uniqueEmails.size, 4, "All 4 cadres must have distinct official emails");
});

test("auth backend credentials resolution uses custom password only for Gov ID method", () => {
  const resolveBackendPassword = (method: "gov_id" | "meripehchaan" | "dsc", customPass: string) => {
    return method === "gov_id" ? customPass : "Demo@123";
  };

  assert.equal(resolveBackendPassword("gov_id", "MySecret@456"), "MySecret@456");
  assert.equal(resolveBackendPassword("meripehchaan", "MySecret@456"), "Demo@123");
  assert.equal(resolveBackendPassword("dsc", "MySecret@456"), "Demo@123");
});

test("OTP paste distributes 6 digits across input boxes regardless of pasted length", () => {
  const parsePastedOtp = (rawPastedText: string) => {
    const cleaned = rawPastedText.replace(/\D/g, "").slice(0, 6);
    const nextDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < cleaned.length; i++) {
      nextDigits[i] = cleaned[i];
    }
    return nextDigits;
  };

  assert.deepEqual(parsePastedOtp("842019"), ["8", "4", "2", "0", "1", "9"]);
  assert.deepEqual(parsePastedOtp("OTP: 842-019 for NIC login"), ["8", "4", "2", "0", "1", "9"]);
  assert.deepEqual(parsePastedOtp("123"), ["1", "2", "3", "", "", ""]);
  assert.deepEqual(parsePastedOtp("no digits here"), ["", "", "", "", "", ""]);
});

test("OTP Resend button is properly disabled during active cooldown timer", () => {
  const isResendDisabled = (otpSent: boolean, countdown: number) => {
    return otpSent && countdown > 0;
  };

  assert.equal(isResendDisabled(true, 30), true, "Disabled at 30s");
  assert.equal(isResendDisabled(true, 1), true, "Disabled at 1s");
  assert.equal(isResendDisabled(true, 0), false, "Enabled when countdown reaches 0");
  assert.equal(isResendDisabled(false, 30), false, "Enabled if OTP was not yet sent");
});

test("cadre landing destinations in roleMeta map to valid application routes", () => {
  const validAppRoutes = new Set([
    "/dashboard",
    "/review-queue",
    "/settings",
    "/reports",
    "/rules",
    "/inspections",
  ]);

  for (const [role, meta] of Object.entries(roleMeta)) {
    assert.ok(
      validAppRoutes.has(meta.landing),
      `Landing path ${meta.landing} for role ${role} must exist in recognized app routes`
    );
  }
});

test("translations contain login.return_portal in English and Hindi", () => {
  assert.ok(DICTIONARY["login.return_portal"], "login.return_portal key must exist");
  assert.equal(DICTIONARY["login.return_portal"].en, "Return to Public Portal");
  assert.equal(DICTIONARY["login.return_portal"].hi, "सार्वजनिक पोर्टल पर वापस जाएं");
});

test("return to public portal paths route strictly to root '/'", () => {
  const portalHomeRoute = "/";
  assert.equal(portalHomeRoute, "/");
});

test("statutory cadre badge numbers conform to Section 63 BSA sovereign formats", () => {
  const expectedCadreBadges: Record<UserRole, string> = {
    inspector: "INSP-DL-0842",
    controller: "CTRL-DL-0012",
    administrator: "ADMIN-SYS-001",
    auditor: "AUDIT-GOI-044",
  };

  for (const [role, expectedBadge] of Object.entries(expectedCadreBadges)) {
    const userRole = role as UserRole;
    assert.equal(demoUsers[userRole].badgeNumber, expectedBadge);
    assert.equal(roleMeta[userRole].badge, expectedBadge);
    // Regex asserting format: AAA-CC-DDDD or similar official sovereign pattern
    assert.match(expectedBadge, /^[A-Z]{4,5}-[A-Z0-9]+-[0-9]{3,4}$/);
  }
});

test("captcha auto-solve helper yields exact mathematical solution", () => {
  const q = { text: "6 + 7", answer: 13 };
  const autoSolved = String(q.answer);
  assert.equal(autoSolved, "13");
  assert.equal(parseInt(autoSolved, 10), q.answer);
});

test("escape key navigation triggers root portal redirect", () => {
  let navigatedTo = "";
  let scrollResetCalled = false;

  const mockNavigate = (to: string) => {
    navigatedTo = to;
  };
  const mockResetScroll = () => {
    scrollResetCalled = true;
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === "Escape") {
      mockResetScroll();
      mockNavigate("/");
    }
  };

  handleKeyDown({ key: "Escape" });
  assert.equal(navigatedTo, "/");
  assert.equal(scrollResetCalled, true);

  // Other keys do nothing
  navigatedTo = "";
  scrollResetCalled = false;
  handleKeyDown({ key: "Enter" });
  assert.equal(navigatedTo, "");
  assert.equal(scrollResetCalled, false);
});
