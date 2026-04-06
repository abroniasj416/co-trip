import { InputHTMLAttributes } from 'react';
import styles from './FormInput.module.css';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function FormInput({ label, error, id, ...inputProps }: FormInputProps) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input id={id} className={`${styles.input} ${error ? styles.inputError : ''}`} {...inputProps} />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export default FormInput;
