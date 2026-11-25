import { describe, it, expect } from 'vitest';
import { ImageIndexer } from '../src/core/image_indexer';
import { PrivacySettings } from '../src/types';

describe('ImageIndexer', () => {
  const privacyEnabled: PrivacySettings = {
    blacklistedPaths: [],
    indexContents: true,
    enableOcr: true,
    enableTelemetry: false,
    maxFileSizeMb: 25,
  };

  const privacyDisabled: PrivacySettings = {
    ...privacyEnabled,
    enableOcr: false,
  };

  it('detects visual objects and keywords from OCR text', () => {
    const meta = ImageIndexer.processImageOcr(
      'Screenshot_App.png',
      'Dashboard CPU 45% Memory 8GB and server chart performance',
      privacyEnabled
    );

    expect(meta.hasOcrText).toBe(true);
    expect(meta.detectedObjects).toContain('screenshot');
    expect(meta.detectedObjects).toContain('dashboard');
    expect(meta.detectedObjects).toContain('chart');
  });

  it('respects privacy settings when OCR is disabled', () => {
    const meta = ImageIndexer.processImageOcr(
      'Confidential_Slide.png',
      'Confidential revenue projections',
      privacyDisabled
    );

    expect(meta.hasOcrText).toBe(false);
    expect(meta.ocrSnippet).toBeUndefined();
  });

  it('converts image file into SearchResult structure with tags', () => {
    const file = {
      name: 'screenshot_code.png',
      path: 'C:/Pictures/screenshot_code.png',
      size: 1024 * 300,
      modifiedAt: '2026-11-24T12:00:00Z',
      rawOcrText: 'export const run = () => { console.log("OK"); }',
    };

    const result = ImageIndexer.indexImage(file, privacyEnabled);
    expect(result.category).toBe('MEDIA');
    expect(result.tags).toContain('png');
    expect(result.tags).toContain('code');
    expect(result.snippet).toContain('export const run');
  });
});
