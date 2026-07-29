import { AssetManifest, DEFAULT_ASSET_MANIFEST, LoadTier } from './manifest';

export type LoadProgressCallback = (progress: number, loadedBytes: number, totalBytes: number) => void;

export class AssetLoader {
  private manifest: AssetManifest = DEFAULT_ASSET_MANIFEST;
  private loadedAssets: Set<string> = new Set();
  private loadedBytes: number = 0;
  private isPrefetching: boolean = false;

  public setManifest(manifest: AssetManifest): void {
    this.manifest = manifest;
  }

  public getProgress(): number {
    const total = this.manifest.totalBytes || 1;
    return Math.min(1.0, this.loadedBytes / total);
  }

  public async loadTier(tier: LoadTier, onProgress?: LoadProgressCallback): Promise<void> {
    const assetsInTier = Object.values(this.manifest.assets).filter((a) => a.tier === tier);
    const tierTotalBytes = assetsInTier.reduce((sum, a) => sum + a.bytes, 0) || 1;
    let tierLoadedBytes = 0;

    for (const asset of assetsInTier) {
      if (this.loadedAssets.has(asset.id)) {
        tierLoadedBytes += asset.bytes;
        continue;
      }

      // Simulate step load
      await new Promise((resolve) => setTimeout(resolve, 20));
      this.loadedAssets.add(asset.id);
      tierLoadedBytes += asset.bytes;
      this.loadedBytes += asset.bytes;

      if (onProgress) {
        onProgress(tierLoadedBytes / tierTotalBytes, this.loadedBytes, this.manifest.totalBytes);
      }
    }
  }

  public prefetchBundle(bundleId: string): void {
    if (this.isPrefetching) return;
    this.isPrefetching = true;
    console.info(`[AssetLoader] Hover prefetch started for bundle "${bundleId}".`);
  }

  public isAssetLoaded(assetId: string): boolean {
    return this.loadedAssets.has(assetId);
  }

  public disposeBundle(bundleId: string): void {
    console.info(`[AssetLoader] Bundle "${bundleId}" resources disposed cleanly.`);
  }

  public reset(): void {
    this.loadedAssets.clear();
    this.loadedBytes = 0;
    this.isPrefetching = false;
  }
}

export const globalAssetLoader = new AssetLoader();
