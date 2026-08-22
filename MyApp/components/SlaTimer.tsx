import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

interface SlaTimerProps {
  createdAt: string;
  status: string;
  acceptedAt?: string;
}

export default function SlaTimer({ createdAt, status, acceptedAt }: SlaTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(60);

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

  if (status === 'RESOLVED') return <Text style={styles.resolved}>-</Text>;
  if (status === 'ESCALATED') return <Text style={styles.escalated}>Escalated</Text>;

  let color = '#10b981'; // Green
  if (timeLeft <= 10) color = '#ef4444'; // Red
  else if (timeLeft <= 30) color = '#f59e0b'; // Yellow

  return (
    <Text style={[styles.timer, { color }]}>
      {status === 'PENDING' ? 'Awaiting Accept: ' : ''}
      {timeLeft > 0 ? `00:${timeLeft.toString().padStart(2, '0')}` : '00:00'}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: { fontWeight: 'bold', fontSize: 14, marginTop: 4 },
  resolved: { color: '#6b7280', marginTop: 4 },
  escalated: { color: '#ef4444', fontWeight: 'bold', marginTop: 4 },
});
