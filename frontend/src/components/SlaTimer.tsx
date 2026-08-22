import { useState, useEffect } from 'react';

interface SlaTimerProps {
  createdAt: string;
  status: string;
  acceptedAt?: string;
}

export default function SlaTimer({ createdAt, status, acceptedAt }: SlaTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(60); // Assuming 60s SLA for MVP

  useEffect(() => {
    if (status === 'ESCALATED' || status === 'RESOLVED') return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      
      if (status === 'PENDING') {
        const createdTime = new Date(createdAt).getTime();
        const diff = Math.max(0, Math.floor(60 - (now - createdTime) / 1000));
        setTimeLeft(diff);
      } else if (status === 'IN_PROGRESS' && acceptedAt) {
        const acceptedTime = new Date(acceptedAt).getTime();
        const diff = Math.max(0, Math.floor(60 - (now - acceptedTime) / 1000));
        setTimeLeft(diff);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status, acceptedAt]);

  if (status === 'RESOLVED') return <span className="text-gray-500">-</span>;
  if (status === 'ESCALATED') return <span className="text-red-500 font-bold">Escalated</span>;

  let colorClass = 'text-green-500';
  if (timeLeft <= 10) colorClass = 'text-red-500';
  else if (timeLeft <= 30) colorClass = 'text-yellow-500';

  return (
    <span className={`font-bold ${colorClass}`}>
      {status === 'PENDING' ? 'Awaiting Accept: ' : ''}
      {timeLeft > 0 ? `00:${timeLeft.toString().padStart(2, '0')}` : '00:00'}
    </span>
  );
}
