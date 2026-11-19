'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Lesson } from '@/features/course/types/course-types';
import type { LessonEdits } from '@/features/course/types/curriculum-types';

/** One request at a time; a flush drains edits made while a request is pending. */
export function useLessonAutosave(
    initial: LessonEdits,
    save: (edits: LessonEdits) => Promise<Lesson>,
    onSaved: (lesson: Lesson) => void
) {
    const [values, setValues] = useState(initial);
    const [saved, setSaved] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date>();
    const current = useRef(initial);
    const baseline = useRef(initial);
    const request = useRef<Promise<boolean> | null>(null);
    const callbacks = useRef({ save, onSaved });
    useEffect(() => {
        callbacks.current = { save, onSaved };
    }, [save, onSaved]);
    const dirty = JSON.stringify(values) !== JSON.stringify(saved);

    const edit = useCallback((patch: Partial<LessonEdits>) => {
        current.current = { ...current.current, ...patch };
        setValues(current.current);
        setError(null);
    }, []);

    const flush = useCallback((): Promise<boolean> => {
        if (request.current) return request.current;
        const drain = async () => {
            setSaving(true);
            setError(null);
            try {
                while (JSON.stringify(current.current) !== JSON.stringify(baseline.current)) {
                    const snapshot = { ...current.current };
                    const lesson = await callbacks.current.save(snapshot);
                    baseline.current = snapshot;
                    setSaved(snapshot);
                    setLastSaved(new Date());
                    callbacks.current.onSaved(lesson);
                }
                return true;
            } catch (cause) {
                setError(cause instanceof Error ? cause.message : 'Failed to save lesson');
                return false;
            } finally {
                setSaving(false);
                request.current = null;
            }
        };
        // Schedule after assigning the promise even when the drain has no awaits.
        request.current = Promise.resolve().then(drain);
        return request.current;
    }, []);

    useEffect(() => {
        if (!dirty || error) return;
        const timeout = setTimeout(() => {
            void flush();
        }, 1000);
        return () => clearTimeout(timeout);
    }, [values, dirty, error, flush]);

    return { values, edit, flush, dirty: dirty || saving, saving, error, lastSaved };
}
