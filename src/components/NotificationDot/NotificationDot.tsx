interface NotificationDotProps {
  show: boolean;
}

export const NotificationDot = ({ show }: NotificationDotProps) => {
  if (!show) return null;
  
  return (
    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
  );
};