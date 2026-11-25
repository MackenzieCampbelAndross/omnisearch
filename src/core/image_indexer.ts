import { SearchResult, PrivacySettings } from '../types';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  hasOcrText: boolean;
  ocrSnippet?: string;
  detectedObjects: string[];
}

export class ImageIndexer {
  /**
   * Simulate OCR processing on screenshot or image file
   */
  static processImageOcr(
    filename: string,
    rawText: string = '',
    privacy: PrivacySettings
  ): ImageMetadata {
    if (!privacy.enableOcr) {
      return {
        width: 1920,
        height: 1080,
        format: filename.split('.').pop()?.toUpperCase() || 'PNG',
        hasOcrText: false,
        detectedObjects: ['image'],
      };
    }

    const detectedObjects: string[] = ['image'];
    const lowerText = rawText.toLowerCase();

    if (lowerText.includes('chart') || lowerText.includes('graph') || lowerText.includes('revenue')) {
      detectedObjects.push('chart', 'diagram');
    }
    if (lowerText.includes('code') || lowerText.includes('fn') || lowerText.includes('export')) {
      detectedObjects.push('code', 'terminal');
    }
    if (lowerText.includes('cpu') || lowerText.includes('memory') || lowerText.includes('port')) {
      detectedObjects.push('dashboard', 'telemetry');
    }
    if (filename.toLowerCase().includes('screenshot')) {
      detectedObjects.push('screenshot');
    }

    return {
      width: 1920,
      height: 1080,
      format: filename.split('.').pop()?.toUpperCase() || 'PNG',
      hasOcrText: rawText.length > 0,
      ocrSnippet: rawText ? rawText.slice(0, 180) : undefined,
      detectedObjects,
    };
  }

  /**
   * Convert image into searchable SearchResult with visual tags and OCR text
   */
  static indexImage(
    file: {
      name: string;
      path: string;
      size: number;
      modifiedAt: string;
      rawOcrText?: string;
    },
    privacy: PrivacySettings
  ): SearchResult {
    const meta = this.processImageOcr(file.name, file.rawOcrText, privacy);

    return {
      id: `img_${file.path.replace(/[^\w]/g, '_')}`,
      title: file.name,
      subtitle: file.path,
      path: file.path,
      category: 'MEDIA',
      score: 1.0,
      icon: 'Image',
      size: file.size,
      modifiedAt: file.modifiedAt,
      snippet: meta.ocrSnippet ? `OCR: ${meta.ocrSnippet}` : undefined,
      tags: ['media', meta.format.toLowerCase(), ...meta.detectedObjects],
      metadata: {
        resolution: `${meta.width}x${meta.height}`,
        format: meta.format,
        ocrEnabled: meta.hasOcrText ? 1 : 0,
      },
    };
  }
}
