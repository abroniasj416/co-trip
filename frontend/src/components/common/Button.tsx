import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'outline';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} onClick={onClick}>
      {label}
    </button>
  );
}

export default Button;
