import { useState } from 'react';
import { Place, PlaceStatus } from '../../types/place';
import { usePlaces } from '../../context/PlaceContext';
import styles from './PlacePanel.module.css';

interface PlacePanelProps {
  planId: string;
  onStatusChange: (placeId: number, status: PlaceStatus) => void;
  onMemoChange: (placeId: number, memo: string) => void;
  onDelete: (placeId: number) => void;
  onReorder: (placeId: number, direction: 'up' | 'down') => void;
}

function PlacePanel({ onStatusChange, onMemoChange, onDelete, onReorder }: PlacePanelProps) {
  const { places, selectedPlaceId, selectPlace } = usePlaces();
  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);
  const [memoText, setMemoText] = useState('');

  const candidates = places.filter((p) => p.status === 'CANDIDATE');
  const confirmed = places.filter((p) => p.status === 'CONFIRMED')
    .sort((a, b) => a.placeOrder - b.placeOrder);

  function startEditMemo(place: Place) {
    setEditingMemoId(place.id);
    setMemoText(place.memo ?? '');
  }

  function saveMemo(placeId: number) {
    onMemoChange(placeId, memoText);
    setEditingMemoId(null);
  }

  return (
    <div className={styles.panel}>
      {places.length === 0 && (
        <p className={styles.empty}>지도를 클릭하여 장소를 추가하세요.</p>
      )}

      {confirmed.length > 0 && (
        <div className={styles.group}>
          <h4 className={styles.groupTitle}>
            <span className={styles.dot} style={{ background: '#3b82f6' }} />
            확정 장소 ({confirmed.length})
          </h4>
          {confirmed.map((place, index) => (
            <PlaceCard
              key={place.id}
              place={place}
              orderNumber={index + 1}
              isSelected={place.id === selectedPlaceId}
              isEditingMemo={editingMemoId === place.id}
              memoText={memoText}
              onSelect={() => selectPlace(place.id === selectedPlaceId ? null : place.id)}
              onStatusChange={onStatusChange}
              onStartEditMemo={() => startEditMemo(place)}
              onMemoTextChange={setMemoText}
              onSaveMemo={() => saveMemo(place.id)}
              onCancelMemo={() => setEditingMemoId(null)}
              onDelete={onDelete}
              canMoveUp={index > 0}
              canMoveDown={index < confirmed.length - 1}
              onMoveUp={() => onReorder(place.id, 'up')}
              onMoveDown={() => onReorder(place.id, 'down')}
            />
          ))}
        </div>
      )}

      {candidates.length > 0 && (
        <div className={styles.group}>
          <h4 className={styles.groupTitle}>
            <span className={styles.dot} style={{ background: '#f59e0b' }} />
            후보 장소 ({candidates.length})
          </h4>
          {candidates.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              orderNumber={null}
              isSelected={place.id === selectedPlaceId}
              isEditingMemo={editingMemoId === place.id}
              memoText={memoText}
              onSelect={() => selectPlace(place.id === selectedPlaceId ? null : place.id)}
              onStatusChange={onStatusChange}
              onStartEditMemo={() => startEditMemo(place)}
              onMemoTextChange={setMemoText}
              onSaveMemo={() => saveMemo(place.id)}
              onCancelMemo={() => setEditingMemoId(null)}
              onDelete={onDelete}
              canMoveUp={false}
              canMoveDown={false}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PlaceCardProps {
  place: Place;
  orderNumber: number | null;
  isSelected: boolean;
  isEditingMemo: boolean;
  memoText: string;
  onSelect: () => void;
  onStatusChange: (placeId: number, status: PlaceStatus) => void;
  onStartEditMemo: () => void;
  onMemoTextChange: (text: string) => void;
  onSaveMemo: () => void;
  onCancelMemo: () => void;
  onDelete: (placeId: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function PlaceCard({
  place, orderNumber, isSelected, isEditingMemo, memoText,
  onSelect, onStatusChange, onStartEditMemo,
  onMemoTextChange, onSaveMemo, onCancelMemo, onDelete,
  canMoveUp, canMoveDown, onMoveUp, onMoveDown,
}: PlaceCardProps) {
  const isConfirmed = place.status === 'CONFIRMED';

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}>
      <div className={styles.cardHeader} onClick={onSelect}>
        <div className={styles.nameRow}>
          {orderNumber != null && (
            <span className={styles.orderBadge}>{orderNumber}</span>
          )}
          <span className={styles.placeName}>{place.name}</span>
        </div>
        <button
          className={`${styles.statusBadge} ${isConfirmed ? styles.confirmed : styles.candidate}`}
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(place.id, isConfirmed ? 'CANDIDATE' : 'CONFIRMED');
          }}
        >
          {isConfirmed ? '✓ 확정' : '후보'}
        </button>
      </div>

      <p className={styles.createdBy}>{place.createdBy}</p>

      {isEditingMemo ? (
        <div className={styles.memoEdit}>
          <textarea
            className={styles.memoInput}
            value={memoText}
            onChange={(e) => onMemoTextChange(e.target.value)}
            placeholder="메모를 입력하세요..."
            rows={2}
            autoFocus
          />
          <div className={styles.memoActions}>
            <button className={styles.saveMemo} onClick={onSaveMemo}>저장</button>
            <button className={styles.cancelMemo} onClick={onCancelMemo}>취소</button>
          </div>
        </div>
      ) : (
        <div className={styles.memoRow} onClick={onStartEditMemo}>
          {place.memo
            ? <p className={styles.memoText}>{place.memo}</p>
            : <p className={styles.memoPlaceholder}>+ 메모 추가</p>
          }
        </div>
      )}

      <div className={styles.cardFooter}>
        {isConfirmed && (
          <div className={styles.orderButtons}>
            <button
              className={styles.arrowButton}
              disabled={!canMoveUp}
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              title="위로"
            >▲</button>
            <button
              className={styles.arrowButton}
              disabled={!canMoveDown}
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              title="아래로"
            >▼</button>
          </div>
        )}
        <button
          className={styles.deleteButton}
          onClick={(e) => { e.stopPropagation(); onDelete(place.id); }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default PlacePanel;
