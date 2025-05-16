import { moment } from "obsidian";
import en from "./languages/en";
import zh from "./languages/zh";

// type Translations = Partial<typeof en>; // 如果有漏的暂时不补，可以用这个
type Translations = typeof en; // 用来检查是否有遗漏

class I18nService {
  private currentLanguage: string;
  private translations: Record<string, Translations> = {
    en,
    'zh-cn' : zh,
  };

  constructor() {
    // 获取Obsidian当前语言设置
    this.currentLanguage = moment.locale() || 'en';
  }

  t(key: keyof Translations, vars?: Record<string, string>): string {
    let text = this.translations[this.currentLanguage]?.[key] ||
      this.translations['en'][key] ||
      key.toString();

    if (vars) {
      Object.keys(vars).forEach(varKey => {
        text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), vars[varKey]);
      });
    }

    return text;
  }

  setLanguage(lang: string) {
    this.currentLanguage = lang;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

export const i18n = new I18nService();