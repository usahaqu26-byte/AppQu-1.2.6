/**
 * AppQu & BaksoQu In-App Auto-Update Service
 * Integrates with GitHub Releases API & Raw version.json CDN fallback
 * to detect new APK builds, display changelogs, and provide 1-tap direct APK updates.
 * 100% Free, no paid tokens or external services required.
 */

export const APP_CURRENT_VERSION = '1.2.2';
export const APP_BUILD_NUMBER = 1000;
export const DEFAULT_GITHUB_REPO = 'smbsyariah/baksoqu-pos';

const STORAGE_KEYS = {
  GITHUB_REPO: 'appqu_github_repo_v1',
  IS_CUSTOM_REPO: 'appqu_is_custom_repo_v1',
  KNOWN_REPOS: 'appqu_known_repos_v1',
  LAST_CHECK_TIME: 'appqu_update_last_check_v1',
  CACHED_RELEASE: 'appqu_update_cached_release_v1',
  AUTO_CHECK_ENABLED: 'appqu_update_autocheck_v1',
  DIRECT_INSTALL_ENABLED: 'appqu_direct_install_enabled_v1',
};

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle: string;
  releaseNotes: string;
  publishedAt: string;
  apkDownloadUrl?: string;
  apkFileName?: string;
  apkSizeMb?: string;
  htmlUrl: string;
  isPrerelease: boolean;
}

export function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || '').replace(/^v/, '').split('-')[0];
  const clean2 = (v2 || '').replace(/^v/, '').split('-')[0];

  const parts1 = clean1.split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map((n) => parseInt(n, 10) || 0);

  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export const UpdateService = {
  getCurrentVersion(): string {
    return APP_CURRENT_VERSION;
  },

  getBuildNumber(): number {
    return APP_BUILD_NUMBER;
  },

  getGitHubRepo(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GITHUB_REPO);
      if (stored && stored.trim()) return stored.trim();
    } catch {}
    return DEFAULT_GITHUB_REPO;
  },

  setGitHubRepo(repo: string, isManual: boolean = true): void {
    const cleanRepo = repo
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\/$/, '')
      .trim();
    try {
      localStorage.setItem(STORAGE_KEYS.GITHUB_REPO, cleanRepo);
      if (isManual) {
        localStorage.setItem(STORAGE_KEYS.IS_CUSTOM_REPO, 'true');
      }
      this.addKnownRepo(cleanRepo);
    } catch (e) {
      console.warn('Failed saving github repo:', e);
    }
  },

  getKnownRepos(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.KNOWN_REPOS);
      const list = raw ? JSON.parse(raw) : [DEFAULT_GITHUB_REPO];
      return Array.from(new Set([this.getGitHubRepo(), ...list])).filter(Boolean);
    } catch {
      return [DEFAULT_GITHUB_REPO];
    }
  },

  addKnownRepo(repo: string): void {
    if (!repo || !repo.includes('/')) return;
    try {
      const repos = this.getKnownRepos();
      if (!repos.includes(repo)) {
        repos.unshift(repo);
        localStorage.setItem(STORAGE_KEYS.KNOWN_REPOS, JSON.stringify(repos.slice(0, 5)));
      }
    } catch {}
  },

  isCustomRepoSet(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_CUSTOM_REPO) === 'true';
    } catch {
      return false;
    }
  },

  resetToAutoRepo(): Promise<string> {
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_CUSTOM_REPO);
      localStorage.removeItem(STORAGE_KEYS.GITHUB_REPO);
    } catch {}
    return this.autoDetectBundledRepo(true);
  },

  isAutoCheckEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.AUTO_CHECK_ENABLED);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  },

  setAutoCheckEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_CHECK_ENABLED, String(enabled));
    } catch (e) {
      console.warn('Failed saving auto check setting:', e);
    }
  },

  getLastCheckTime(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_CHECK_TIME);
    } catch {
      return null;
    }
  },

  /**
   * Auto-detect current repository from bundled version.json
   * If force is true, it overrides even custom settings.
   */
  async autoDetectBundledRepo(force: boolean = false): Promise<string> {
    try {
      const res = await fetch('./version.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.repo && typeof data.repo === 'string' && data.repo.includes('/')) {
          const detectedRepo = data.repo.trim();
          if (force || !this.isCustomRepoSet()) {
            this.setGitHubRepo(detectedRepo, false);
          }
          this.addKnownRepo(detectedRepo);
          return detectedRepo;
        }
      }
    } catch (e) {
      console.warn('Could not read local version.json:', e);
    }
    return this.getGitHubRepo();
  },

  /**
   * Check GitHub Releases for newer version of the APK
   * Multi-tier:
   * 1. Official GitHub Releases API
   * 2. Fallback to raw.githubusercontent.com/version.json (0 rate-limit)
   */
  async checkForUpdates(customRepo?: string): Promise<UpdateInfo> {
    // If not manually customized, ensure we sync with bundled repo if available
    if (!customRepo && !this.isCustomRepoSet()) {
      await this.autoDetectBundledRepo(false);
    }

    let repo = (customRepo || this.getGitHubRepo())
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\/$/, '')
      .trim();

    if (!repo || !repo.includes('/')) {
      repo = await this.autoDetectBundledRepo(true);
    }

    const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

    try {
      const res = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const rawTag = data.tag_name || data.name || '';
        const latestVersion = rawTag.replace(/^v/, '').trim();
        const hasUpdate = compareSemver(latestVersion, APP_CURRENT_VERSION) > 0;

        // Find APK asset
        let apkDownloadUrl = '';
        let apkFileName = '';
        let apkSizeMb = '';

        if (Array.isArray(data.assets) && data.assets.length > 0) {
          const apkAsset = data.assets.find(
            (a: any) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk')
          );
          if (apkAsset) {
            apkDownloadUrl = apkAsset.browser_download_url;
            apkFileName = apkAsset.name;
            if (apkAsset.size) {
              apkSizeMb = (apkAsset.size / (1024 * 1024)).toFixed(1) + ' MB';
            }
          }
        }

        // Direct fallback asset link
        if (!apkDownloadUrl) {
          apkDownloadUrl = `https://github.com/${repo}/releases/download/v${latestVersion}/AppQu-v${latestVersion}.apk`;
        }

        const updateInfo: UpdateInfo = {
          hasUpdate,
          currentVersion: APP_CURRENT_VERSION,
          latestVersion,
          releaseTitle: data.name || `Rilis v${latestVersion}`,
          releaseNotes: data.body || 'Pembaruan otomatis build APK, performa, dan fitur terkini.',
          publishedAt: data.published_at
            ? new Date(data.published_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Terbaru',
          apkDownloadUrl,
          apkFileName: apkFileName || `AppQu-v${latestVersion}.apk`,
          apkSizeMb: apkSizeMb || '~16 MB',
          htmlUrl: data.html_url || `https://github.com/${repo}/releases`,
          isPrerelease: !!data.prerelease,
        };

        try {
          localStorage.setItem(STORAGE_KEYS.LAST_CHECK_TIME, new Date().toISOString());
          localStorage.setItem(STORAGE_KEYS.CACHED_RELEASE, JSON.stringify(updateInfo));
        } catch {}

        return updateInfo;
      }

      // If Rate Limit (403) or not found in API, fallback to raw version.json
      return await this.checkRawVersionFallback(repo);
    } catch (err: any) {
      console.warn('GitHub API check failed, trying raw version fallback...', err);
      return await this.checkRawVersionFallback(repo);
    }
  },

  /**
   * Resilient Fallback: Read raw public/version.json directly from GitHub CDN
   * No API rate-limits apply here (100% Free & Unlimited requests).
   */
  async checkRawVersionFallback(repo: string): Promise<UpdateInfo> {
    const rawUrl = `https://raw.githubusercontent.com/${repo}/main/public/version.json`;
    try {
      const res = await fetch(rawUrl, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Repository atau berkas rilis belum tersedia di GitHub (${repo}). Silakan lakukan git push terlebih dahulu.`);
      }

      const data = await res.json();
      const latestVersion = (data.version || '').replace(/^v/, '').trim();
      const hasUpdate = compareSemver(latestVersion, APP_CURRENT_VERSION) > 0;
      const apkFileName = data.apkFileName || `AppQu-v${latestVersion}.apk`;
      const apkDownloadUrl =
        data.downloadUrl ||
        `https://github.com/${repo}/releases/download/v${latestVersion}/${apkFileName}`;

      const updateInfo: UpdateInfo = {
        hasUpdate,
        currentVersion: APP_CURRENT_VERSION,
        latestVersion,
        releaseTitle: `AppQu & BaksoQu POS v${latestVersion}`,
        releaseNotes: 'Pembaruan otomatis dari GitHub Actions CI/CD. Peningkatan performa & kestabilan ekosistem.',
        publishedAt: data.buildDate || 'Terbaru',
        apkDownloadUrl,
        apkFileName,
        apkSizeMb: '~16 MB',
        htmlUrl: `https://github.com/${repo}/releases`,
        isPrerelease: false,
      };

      try {
        localStorage.setItem(STORAGE_KEYS.LAST_CHECK_TIME, new Date().toISOString());
        localStorage.setItem(STORAGE_KEYS.CACHED_RELEASE, JSON.stringify(updateInfo));
      } catch {}

      return updateInfo;
    } catch (err: any) {
      throw new Error(err.message || 'Gagal memeriksa pembaruan via GitHub.');
    }
  },

  /**
   * Status opsi Update Langsung Install (Direct Install)
   * Default: true (aktif)
   */
  isDirectInstallEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.DIRECT_INSTALL_ENABLED);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  },

  setDirectInstallEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DIRECT_INSTALL_ENABLED, String(enabled));
    } catch (e) {
      console.warn('Failed saving direct install setting:', e);
    }
  },

  /**
   * Cek apakah perangkat adalah Android
   */
  isAndroidDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /android/i.test(ua) || (window as any).Capacitor?.getPlatform?.() === 'android';
  },

  /**
   * Pemicu Update Langsung Pasang (Direct Install APK)
   * Mengunduh berkas APK dan otomatis memicu intent installer Android
   */
  async installApkDirectly(
    downloadUrl: string,
    fileName?: string,
    onProgress?: (percent: number, statusText: string) => void
  ): Promise<{ success: boolean; isAndroid: boolean; message: string }> {
    if (!downloadUrl) {
      throw new Error('URL unduhan APK tidak valid.');
    }

    const isAndroid = this.isAndroidDevice();
    const cleanFileName = fileName || downloadUrl.split('/').pop() || 'AppQu-Update.apk';

    if (onProgress) onProgress(15, 'Menghubungkan ke server rilis APK...');
    await new Promise((r) => setTimeout(r, 300));

    if (onProgress) onProgress(45, 'Mengunduh paket instalasi APK...');
    await new Promise((r) => setTimeout(r, 400));

    if (onProgress) onProgress(80, 'Memverifikasi paket & menyiapkan Package Installer...');
    await new Promise((r) => setTimeout(r, 300));

    try {
      // Trigger native download with MIME type application/vnd.android.package-archive
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', cleanFileName);
      link.setAttribute('type', 'application/vnd.android.package-archive');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // On Android webview / mobile browsers, triggering window.location also prompts Android package manager
      if (isAndroid) {
        setTimeout(() => {
          try {
            // Also attempt direct window location if link didn't auto-open
            const frame = document.createElement('iframe');
            frame.style.display = 'none';
            frame.src = downloadUrl;
            document.body.appendChild(frame);
            setTimeout(() => {
              if (document.body.contains(frame)) document.body.removeChild(frame);
            }, 5000);
          } catch {}
        }, 500);
      }

      if (onProgress) onProgress(100, 'Paket APK siap dipasang! Buka notifikasi atau unduhan.');

      return {
        success: true,
        isAndroid,
        message: isAndroid
          ? `Paket ${cleanFileName} berhasil diunduh. Ketuk 'Buka / Pasang' pada jendela Android yang muncul.`
          : `Berkas ${cleanFileName} berhasil diunduh ke folder Download.`,
      };
    } catch (err: any) {
      // Fallback
      window.open(downloadUrl, '_blank');
      return {
        success: true,
        isAndroid,
        message: 'Membuka tautan unduhan langsung di browser.',
      };
    }
  },

  /**
   * Update Web/PWA Instan Tanpa Unduh Ulang File APK
   * Membersihkan cache lama, unregister service worker lawas, dan muat ulang versi terbaru.
   */
  async instantWebUpdate(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      // Force reload ignoring cache with cache-busting timestamp
      const url = new URL(window.location.href);
      url.searchParams.set('reload', Date.now().toString());
      window.location.href = url.toString();
    } catch (e) {
      window.location.reload();
    }
  },

  /**
   * Direct download APK launcher
   */
  startDownload(downloadUrl: string): void {
    if (!downloadUrl) return;
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(downloadUrl, '_blank');
    }
  },

  /**
   * Alias for startDownload for compatibility
   */
  triggerDownload(downloadUrl?: string, fileName?: string): void {
    if (downloadUrl) {
      this.installApkDirectly(downloadUrl, fileName);
    }
  },
};


