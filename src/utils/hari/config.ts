// Mirrors hana/vm/config.go's LangConfig. This repo only ever runs Hari, so
// only KoreanConfig exists here (kanade-docs' own config.ts carries the
// JapaneseConfig equivalent instead) — no runtime language switching inside
// one repo, per the "구조만 미러링, 레포는 분리" decision.
import type { Expression } from "./ast";
import type { Locale } from "./errs";
import type { TypeNames } from "./typecheck";

export interface LangConfig {
  builtinToString: string;
  builtinToNumber: string;
  builtinToCode: string;
  builtinToText: string;
  nativePrefix: string;
  defaultItemName: string;
  defaultIndexName: string;
  nullString: string;
  objectFormat: string; // e.g. "[%s 객체]" — %s replaced with the class name
  trueString: string;
  falseString: string;
  selfWords: string[];
  pluralSelfWords: string[];
  builtinErrorClass: string;
  builtinErrorMessage: string;
  builtinErrorCtorArg: string;

  // ListClearMethod is the one mutating list pseudo-method the runtime spec
  // defines — lists are otherwise manipulated via native syntax, not method
  // calls.
  listClearMethod: string;

  // lengthWord is the property name a list/string's "길이"/length access
  // compares against.
  lengthWord: string;

  // varQuoteOpen/varQuoteClose are the VAR token's own quote characters,
  // needed at runtime for dynamic reflection (`<'변수'>()`).
  varQuoteOpen: string;
  varQuoteClose: string;

  // The four string pseudo-methods (자르기/바꾸기/분리하기/포함확인).
  stringSliceMethod: string;
  stringReplaceMethod: string;
  stringSplitMethod: string;
  stringContainsMethod: string;

  // operatorMethods names the method each operator calls on an object on its
  // left, by the operator's symbol ("==" for both == and !=; spec 3.5).
  // Mirrors Go's magic.Hari / magic.Kanade.
  operatorMethods: Record<string, string>;

  // locale picks the wording errs.localize renders a runtime error in wherever
  // it becomes user-visible text (a `발생했다면` handler's caught message, the
  // Playground's error output). Mirrors vm.LangConfig.Locale.
  locale: Locale;

  // The names of the built-in types (declared-type checks and 입력받자 use them).
  types: TypeNames;

  // parseEmbeddedExpr lexes+parses a `{...}` template-string interpolation's
  // inner code with this language's full grammar. Left undefined for a repo
  // whose evalExpr.ts hardcodes its own Lexer/Parser instead (see this
  // file's header comment) — kept as a field anyway for structural parity
  // with Go's LangConfig.
  parseEmbeddedExpr?: (code: string) => Expression;
}

function isSelfWord(cfg: LangConfig, v: string): boolean {
  return cfg.selfWords.includes(v);
}

function isPluralSelfWord(cfg: LangConfig, v: string): boolean {
  return cfg.pluralSelfWords.includes(v);
}

export const LangConfigUtil = { isSelfWord, isPluralSelfWord };

export const KoreanConfig: LangConfig = {
  builtinToString: "문자로",
  builtinToNumber: "숫자로",
  builtinToCode: "코드로",
  builtinToText: "글자로",
  nativePrefix: "네이티브_",
  defaultItemName: "아이템",
  defaultIndexName: "인덱스",
  nullString: "비어있음",
  objectFormat: "[%s 객체]",
  trueString: "참",
  falseString: "거짓",
  selfWords: ["나"],
  pluralSelfWords: ["우리"],
  builtinErrorClass: "오류",
  builtinErrorMessage: "메시지",
  builtinErrorCtorArg: "초기메시지",
  listClearMethod: "비우기",
  lengthWord: "길이",
  varQuoteOpen: "'",
  varQuoteClose: "'",
  stringSliceMethod: "자르기",
  stringReplaceMethod: "바꾸기",
  stringSplitMethod: "분리하기",
  stringContainsMethod: "포함확인",
  operatorMethods: { "==": "기호 같다", "+": "기호 더하기", "-": "기호 빼기", "*": "기호 곱하기", "/": "기호 나누기", "%": "기호 나머지", ">": "기호 크다", "<": "기호 작다", ">=": "기호 이상", "<=": "기호 이하" },
  locale: "ko",
  types: { number: "숫자", string: "문자열", boolean: "논리", any: "아무거나", list: "목록", dict: "사전", null: "비어있음" },
};

// Bounds nested calls so runaway recursion becomes a catchable RecursionError,
// the same number as hana's vm.MaxCallDepth.
export const MAX_CALL_DEPTH = 10000;
