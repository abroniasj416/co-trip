import { useState } from 'react';
import styles from './ShareUrl.module.css';

interface ShareUrlProps {
  planId: string;
}

function ShareUrl({ planId }: ShareUrlProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/plans/${planId}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 환경 fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>공유 링크</span>
      <div className={styles.row}>
        <span className={styles.url}>{shareUrl}</span>
        <button
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
        >
          {copied ? '복사됨 ✓' : '복사'}
        </button>
      </div>
    </div>
  );
}

export default ShareUrl;
