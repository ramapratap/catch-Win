// First, create the public/assets folder structure:
// public/
//   assets/
//     cookies.webp (your cookie image)

// utils/assets.ts
export const ASSETS = {
  COOKIES: '/assets/cookies.webp',
  // Add more assets as needed
};

export async function loadGameAssets() {
  const assets = Object.values(ASSETS);
  const loadedAssets: { [key: string]: HTMLImageElement | null } = {};
  
  for (const assetPath of assets) {
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = assetPath;
      });
      loadedAssets[assetPath] = img;
      console.log(`✅ Loaded: ${assetPath}`);
    } catch (error) {
      console.warn(`❌ Failed to load: ${assetPath}`, error);
      loadedAssets[assetPath] = null;
    }
  }
  
  return loadedAssets;
}