export function AnimatedBackground() {
  return (
    <div className="absolute w-full max-w-[100rem] max-h-[50rem] left-0 right-0 mr-auto ml-auto z-[-2] h-full overflow-hidden blur-2xl top-0">
      <div className="hero relative h-full bg-gradient-to-tl from-green to-yellow-300 via-orange-300 opacity-70 dark:opacity-70"></div>
    </div>
  );
}
