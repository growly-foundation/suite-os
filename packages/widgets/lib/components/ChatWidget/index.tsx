import styles from './styles.module.css';

export function ChatWidget(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...restProps } = props;
  return (
    <button className={`${className} ${styles.button}`} {...restProps}>
      Hello hehe
    </button>
  );
}
