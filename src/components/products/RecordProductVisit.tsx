'use client';

import { useRecordVisit } from '@/hooks/useRecordVisit';

export default function RecordProductVisit({ id }: { id: string }) {
    useRecordVisit(id);
    return null;
}

