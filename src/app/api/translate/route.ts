import { NextResponse } from 'next/server';
import { TranslationService } from '@/services/translationService';

export async function POST(request: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text to translate is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Supported language codes validation
    const supportedLanguages = [
      'ta', 'en', 'hi', 'ml', 'te', 'kn', 'bn', 'mr', 'gu', 'pa',
      'es', 'fr', 'de', 'ar', 'ja', 'zh-CN'
    ];

    if (!supportedLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        { error: `Unsupported target language: ${targetLanguage}` },
        { status: 400 }
      );
    }

    if (sourceLanguage && sourceLanguage !== 'auto' && !supportedLanguages.includes(sourceLanguage)) {
      return NextResponse.json(
        { error: `Unsupported source language: ${sourceLanguage}` },
        { status: 400 }
      );
    }

    const provider = TranslationService.getProvider();
    const result = await provider.translate(text, targetLanguage, sourceLanguage);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[Translation API] Error during translation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal translation service error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
