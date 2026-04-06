import { FormEvent, useState } from 'react';
import { LatLng } from '../../hooks/useNcpMap';
import styles from './AddPlaceModal.module.css';

interface AddPlaceModalProps {
  latLng: LatLng;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function AddPlaceModal({ latLng, onConfirm, onCancel }: AddPlaceModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('장소 이름을 입력해주세요.'); return; }
    onConfirm(name.trim());
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>📍 장소 추가</h3>
        <p className={styles.coords}>
          {latLng.lat.toFixed(5)}, {latLng.lng.toFixed(5)}
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            type="text"
            placeholder="장소 이름을 입력하세요"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            autoFocus
            maxLength={50}
          />
          {error && <span className={styles.error}>{error}</span>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onCancel}>취소</button>
            <button type="submit" className={styles.confirm}>추가 (후보)</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPlaceModal;
