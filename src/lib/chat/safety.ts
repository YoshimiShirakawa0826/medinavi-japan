// Deterministic safety checks that run before and after the language model.
// They do not depend on the model, so an emergency is flagged even if the model
// is busy, slow or wrong.

// Danger signs in the five supported languages. Matching is case-insensitive
// on NFKC-normalised text. Keep entries specific to avoid alarming on mild symptoms.
const RED_FLAGS: RegExp[] = [
  // Japanese
  /意識が(ない|無い|もうろう|おかしい)|気を失|呼吸が(苦し|でき|止ま)|息が(でき|苦し|止ま)|胸が(痛|苦し|締め付け)|胸の痛み|大量(の)?出血|血が止まらな|けいれん|痙攣|ろれつ|麻痺|まひ|顔がゆが|吐血|血を吐|アナフィラキシー|死にたい|自殺|首を吊/,
  // English
  /unconscious|passed out|not breathing|can'?t breathe|cannot breathe|difficulty breathing|short(ness)? of breath|chest pain|heart attack|stroke|seizure|convuls|heavy bleeding|bleeding (a lot|heavily|won'?t stop)|vomit(ing)? blood|anaphyla|slurred speech|face (is )?droop|paralys|suicid|kill myself|end my life|overdose/i,
  // Chinese (simplified / traditional)
  /昏迷|失去意识|失去意識|呼吸困难|呼吸困難|不能呼吸|无法呼吸|無法呼吸|胸痛|胸口痛|大出血|血流不止|抽搐|吐血|过敏性休克|過敏性休克|中风|中風|想死|自杀|自殺/,
  // Korean
  /의식이 없|의식을 잃|숨을 (못|쉴 수 없)|호흡 곤란|호흡곤란|가슴(이)? (통증|아파)|흉통|대량 출혈|피가 멈추지|경련|발작|피를 토|각혈|토혈|아나필락시스|마비|뇌졸중|죽고 싶|자살/,
  // Spanish
  /inconsciente|perdi[óo] el conocimiento|no puede respirar|no puedo respirar|dificultad para respirar|dolor (en el|de) pecho|dolor tor[áa]cico|infarto|hemorragia|sangra mucho|no para de sangrar|convulsi|vomit(a|o|ando) sangre|anafila|derrame cerebral|par[áa]lisis|suicid|quiero morir|matarme/i,
];

export function detectEmergency(text: string): boolean {
  const normalized = text.normalize('NFKC');
  return RED_FLAGS.some(pattern => pattern.test(normalized));
}

// The free Sarashina beta must not receive information that identifies a person,
// and visitors should not have to share it. Remove common identifiers first.
const REDACTIONS: Array<[RegExp, string]> = [
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]'],
  // Passport-style identifiers: 1-2 letters followed by 6-9 digits.
  [/\b[A-Z]{1,2}\d{6,9}\b/gi, '[id]'],
  // Phone numbers and other long digit runs (keeps 119 / #7119 and short numbers such as ages or temperatures).
  [/\+?\d[\d\s()-]{8,}\d/g, '[number]'],
];

export function redactPersonalInfo(text: string): string {
  let result = text.normalize('NFKC');
  for (const [pattern, replacement] of REDACTIONS) result = result.replace(pattern, replacement);
  return result;
}

// Clinic names, phone numbers and links are shown from our own data as cards,
// never from model text. Remove phone numbers and URLs the model may produce,
// keeping the public emergency and help-line numbers.
const ALLOWED_NUMBERS = new Set(['119', '110', '#7119', '03-3212-2323', '03-5285-8181', '050-3816-2787']);

export function sanitizeReply(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/#?\+?\d[\d-]{6,}\d/g, match => ALLOWED_NUMBERS.has(match) ? match : '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
