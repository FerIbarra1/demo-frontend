'use client';

import { useState, useEffect } from 'react';

interface FormattedDateProps {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

const defaultOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export function FormattedDate({
  date,
  options = defaultOptions,
  className = ''
}: FormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    setFormattedDate(dateObj.toLocaleDateString('es-MX', options));
  }, [date, options]);

  // Renderizar un placeholder durante SSR
  if (!isMounted) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}

export function ShortDate({ date, className = '' }: { date: string | Date; className?: string }) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    setFormattedDate(dateObj.toLocaleDateString('es-MX'));
  }, [date]);

  if (!isMounted) {
    return <span className={className}>.../.../......</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}
