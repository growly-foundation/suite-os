import { useTheme } from '@/components/providers/ThemeProvider';
import { motion } from 'framer-motion';

export const PanelBanner = ({ title, description }: { title: string; description: string }) => {
  const { theme } = useTheme();

  // Create a gradient using theme colors
  const gradient = `linear-gradient(to right, ${theme.brand.primary}, ${theme.brand.accent})`;

  // Use SVG with theme-appropriate colors
  const patternColor = encodeURIComponent(theme.text.inverse);
  const patternSvg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${patternColor}' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E")`;

  return (
    <div className="gas-relative overflow-hidden">
      <div
        className="gas-h-48 gas-w-full"
        style={{
          background: gradient,
        }}>
        <motion.div
          className="gas-absolute gas-inset-0 gas-opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: patternSvg,
            backgroundSize: 'cover',
          }}
        />
      </div>
      <div
        className="gas-absolute gas-bottom-0 gas-left-0 gas-right-0 gas-top-0 gas-w-full gas-p-6 gas-flex gas-flex-col gas-justify-center gas-items-center"
        style={{ color: theme.text.inverse }}>
        <h3 className="gas-text-3xl gas-font-bold gas-mb-1" style={{ color: theme.text.inverse }}>
          {title}
        </h3>
        <p
          className="gas-text-lg"
          style={{
            color: theme.text.inverse,
          }}>
          {description}
        </p>
      </div>
    </div>
  );
};
