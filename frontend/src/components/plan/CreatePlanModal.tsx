import { FormEvent, useState } from 'react';
import styles from './CreatePlanModal.module.css';

interface CreatePlanModalProps {
  onConfirm: (title: string) => void;
  onCancel: () => void;
  loading: boolean;
}

function CreatePlanModal({ onConfirm, onCancel, loading }: CreatePlanModalProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('플랜 제목을 입력해주세요.');
      return;
    }
    onConfirm(title.trim());
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>새 여행 플랜 만들기</h2>
        <p className={styles.subtitle}>어떤 여행을 계획하고 있나요?</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            type="text"
            placeholder="예: 제주도 3박 4일 여행"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            autoFocus
            maxLength={100}
          />
          {error && <span className={styles.error}>{error}</span>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              취소
            </button>
            <button type="submit" className={styles.confirmButton} disabled={loading}>
              {loading ? '생성 중...' : '만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePlanModal;
