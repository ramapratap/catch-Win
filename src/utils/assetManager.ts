// utils/assetManager.ts
export class AssetManager {
  private static images: Map<string, HTMLImageElement> = new Map();
  private static loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  static async loadImage(src: string, fallbackSrc?: string): Promise<HTMLImageElement | null> {
    // Return cached image if available
    if (this.images.has(src)) {
      return this.images.get(src)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(src)) {
      try {
        return await this.loadingPromises.get(src)!;
      } catch {
        return null;
      }
    }

    // Create new loading promise
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.images.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        if (fallbackSrc && fallbackSrc !== src) {
          // Try fallback
          this.loadImage(fallbackSrc).then(resolve).catch(reject);
        } else {
          reject(new Error(`Failed to load image: ${src}`));
        }
      };
      
      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    
    try {
      return await loadPromise;
    } catch (error) {
      console.warn(`Failed to load image: ${src}`, error);
      return null;
    }
  }

  static preloadAssets(assets: string[]): Promise<(HTMLImageElement | null)[]> {
    const loadPromises = assets.map(asset => this.loadImage(asset));
    return Promise.all(loadPromises);
  }

  static getImage(src: string): HTMLImageElement | null {
    return this.images.get(src) || null;
  }

  static clearCache(): void {
    this.images.clear();
    this.loadingPromises.clear();
  }
}