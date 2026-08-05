export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
}

export interface TranslationProvider {
  translate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult>;
}

export class GoogleTranslationProvider implements TranslationProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult> {
    const url = new URL('https://translation.googleapis.com/language/translate/v2');
    url.searchParams.set('key', this.apiKey);

    const body: Record<string, any> = {
      q: text,
      target: targetLanguage,
      format: 'text',
    };

    // If source language is provided and is not 'auto', set it
    if (sourceLanguage && sourceLanguage !== 'auto') {
      body.source = sourceLanguage;
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = 'Google Translation API failure';
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorMsg;
      } catch (e) {
        // use fallback error message
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const translations = data?.data?.translations;

    if (!translations || translations.length === 0) {
      throw new Error('No translation returned from Google Cloud');
    }

    const result = translations[0];
    return {
      translatedText: result.translatedText,
      // If we didn't specify sourceLanguage, Google returns detectedSourceLanguage
      detectedLanguage: result.detectedSourceLanguage || sourceLanguage || 'und',
    };
  }
}

export class MockTranslationProvider implements TranslationProvider {
  async translate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult> {
    // Artificial latency for loading states
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!text.trim()) {
      throw new Error('Input text cannot be empty');
    }

    // Detect language using Unicode range heuristics
    let detected = 'en';
    if (/[\u0B80-\u0BFF]/.test(text)) {
      detected = 'ta';
    } else if (/[\u0900-\u097F]/.test(text)) {
      detected = 'hi';
    } else if (/[\u0D00-\u0D7F]/.test(text)) {
      detected = 'ml';
    } else if (/[\u0C00-\u0C7F]/.test(text)) {
      detected = 'te';
    } else if (/[\u0C80-\u0CFF]/.test(text)) {
      detected = 'kn';
    } else if (/[\u0980-\u09FF]/.test(text)) {
      detected = 'bn';
    } else if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      detected = 'ja';
    }

    const source = (sourceLanguage && sourceLanguage !== 'auto') ? sourceLanguage : detected;

    // Simple dictionary for high-fidelity mocks
    const dictionary: Record<string, Record<string, string>> = {
      'வணக்கம்': { en: 'Hello / Greetings', hi: 'नमस्ते', es: 'Hola' },
      'hello': { ta: 'வணக்கம்', hi: 'नमस्ते', es: 'Hola', fr: 'Bonjour' },
      'how are you': { ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', hi: 'आप कैसे हैं?', es: '¿Cómo estás?' },
      'உழவன்': { en: 'Farmer', hi: 'किसान', es: 'Agricultor' },
      'farmer': { ta: 'விவசாயி', hi: 'किसान', es: 'Agricultor' },
      'நெல்': { en: 'Paddy Rice', hi: 'धान', es: 'Arroz' },
      'paddy': { ta: 'நெல்', hi: 'धान', es: 'Arroz' },
    };

    const cleanText = text.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    let translated = '';

    if (dictionary[cleanText] && dictionary[cleanText][targetLanguage]) {
      translated = dictionary[cleanText][targetLanguage];
    } else {
      // Fallback pseudo-translation generator
      const suffixMap: Record<string, string> = {
        ta: ' (தமிழ் மொழிபெயர்ப்பு)',
        en: ' (English Translation)',
        hi: ' (हिंदी अनुवाद)',
        ml: ' (മലയാളം തർജ്ജമ)',
        te: ' (తెలుగు అనువాదం)',
        kn: ' (ಕನ್ನಡ ಅನುವಾದ)',
        bn: ' (অনুবাদ)',
        mr: ' (मराठी भाषांतर)',
        gu: ' (ગુજરાતી અનુવાદ)',
        pa: ' (ਅਨੁਵਾਦ)',
        es: ' (Traducción al Español)',
        fr: ' (Traduction en Français)',
        de: ' (Deutsche Übersetzung)',
        ar: ' (ترجمة عربية)',
        ja: ' (日本語訳)',
        'zh-CN': ' (中文翻译)',
      };
      translated = `${text}${suffixMap[targetLanguage] || ` [Translated to ${targetLanguage}]`}`;
    }

    return {
      translatedText: translated,
      detectedLanguage: source,
    };
  }
}

export class TranslationService {
  private static provider: TranslationProvider;

  static getProvider(): TranslationProvider {
    if (this.provider) return this.provider;

    const apiKey = process.env.GOOGLE_TRANSLATION_API_KEY;

    if (!apiKey || apiKey === 'your_google_translation_api_key_here' || apiKey === 'mock') {
      console.warn('[TranslationService] GOOGLE_TRANSLATION_API_KEY is not set or set to mock. Using MockTranslationProvider.');
      this.provider = new MockTranslationProvider();
    } else {
      this.provider = new GoogleTranslationProvider(apiKey);
    }

    return this.provider;
  }
}
