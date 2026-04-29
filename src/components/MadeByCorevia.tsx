const MadeByCorevia = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`text-center text-xs sm:text-sm text-muted-foreground py-3 ${className}`}>
      Made by{" "}
      <a
        href="https://corevia.in"
        rel="dofollow"
        target="_blank"
        className="font-medium text-primary hover:underline"
      >
        Corevia
      </a>
    </div>
  );
};

export default MadeByCorevia;
