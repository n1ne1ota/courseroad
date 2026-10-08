'use client';

import type { JSX } from 'react';
import { startTransition, useActionState, useCallback, useEffect, useState } from 'react';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Control, FieldArrayWithId, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { z } from 'zod';

import { Checkbox, showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import { BadgeCircular } from '@courseroad/kurume-ui';
import { Button } from '@courseroad/kurume-ui';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui';
import { ConfirmationDialog } from '@courseroad/kurume-ui';
import { Field, FieldLabel } from '@courseroad/kurume-ui';
import { Input } from '@courseroad/kurume-ui';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger
} from '@courseroad/kurume-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@courseroad/kurume-ui';
import { Separator } from '@courseroad/kurume-ui';
import { Tabs } from '@courseroad/kurume-ui';
import { SUPPORTED_LANGUAGES } from '@courseroad/kurume-ui/editor';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Code2Icon,
  Edit3Icon,
  GripVerticalIcon,
  HammerIcon,
  ListChecksIcon,
  ListIcon,
  MousePointerClickIcon,
  PlusIcon,
  TrashIcon,
  TypeIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { codeToHtml } from 'shiki/bundle/web';

import { saveQuizQuestions } from '@/features/quiz/actions/quiz-questions-actions';
import { QuestionType } from '@/features/quiz/question-types';
import { insertQuizQuestionsSchema } from '@/features/quiz/schemas';

import type { QuizOption, QuizQuestion } from '@/features/quiz/editor-types';

import { QuizMarkdownEditor } from './quiz-markdown-editor';

interface QuizQuestionsBuilderProps {
  initialQuestions: (QuizQuestion & { options: QuizOption[] })[];
  onDirtyChange?: (isDirty: boolean) => void;
  onPendingChange?: (isPending: boolean) => void;
  quizId: string;
}

export type QuizFormValues = z.infer<typeof insertQuizQuestionsSchema>;

// Stable form ID so components can submit via `form` attribute
export const QUESTIONS_FORM_ID = 'quiz-questions-form';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.CUSTOM_INPUT]: 'Custom Input',
  [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QuestionType.SINGLE_CHOICE]: 'Single Choice'
};

const FORMAT_OPTIONS = [
  { icon: <TypeIcon className='h-3.5 w-3.5' />, label: 'Text', value: 'text' as const },
  { icon: <Code2Icon className='h-3.5 w-3.5' />, label: 'Code', value: 'code' as const }
];

/** Language options for the combobox (excluding "Plain text" which has value: null). */
type LangOption = { label: string; value: string };

const LANGUAGE_OPTIONS: LangOption[] = SUPPORTED_LANGUAGES.filter(
  (l: { label: string; value: string | null }): l is LangOption => l.value !== null
);

function LanguagePicker({ onChange, value }: { onChange: (v: string) => void; value: string }) {
  const selected = LANGUAGE_OPTIONS.find(l => l.value === value) ?? null;

  return (
    <Combobox
      items={LANGUAGE_OPTIONS}
      value={selected}
      onValueChange={item => {
        if (item !== null) onChange(item.value);
      }}
    >
      <ComboboxTrigger />
      <ComboboxContent align='start' sideOffset={6}>
        <ComboboxInput placeholder='Search Language' />
        <ComboboxList>
          {(item: LangOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

interface CodeOptionInputProps {
  language: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

/**
 * A single-line code input with Shiki syntax highlighting.
 * Uses a transparent <textarea> for editing layered over a <pre> of highlighted HTML.
 */
function CodeOptionInput({ language, onChange, placeholder, value }: CodeOptionInputProps) {
  const [highlightedHtml, setHighlightedHtml] = useState('');

  useEffect(() => {
    if (!value) {
      return;
    }

    let cancelled = false;

    codeToHtml(value, {
      lang: language,
      themes: { dark: 'github-dark', light: 'github-light' }
    })
      .then(html => {
        if (!cancelled) setHighlightedHtml(html);
      })
      .catch(() => {
        if (!cancelled) setHighlightedHtml('');
      });

    return () => {
      cancelled = true;
    };
  }, [language, value]);

  return (
    <div className='relative flex h-[2.25rem] flex-1 overflow-hidden rounded-md border border-input bg-muted/20 focus-within:ring-1 focus-within:ring-ring'>
      {/* Syntax-highlighted overlay — pointer-events:none so the textarea receives all clicks */}
      <pre
        className='pointer-events-none absolute inset-0 m-0 overflow-hidden px-3 py-[7px] font-mono text-sm leading-5 whitespace-pre'
        dangerouslySetInnerHTML={{ __html: highlightedHtml || value }}
        aria-hidden='true'
      />
      {/* Transparent textarea; caret + selection are still visible */}
      <textarea
        className='relative block h-full w-full resize-none bg-transparent px-3 py-[7px] font-mono text-sm leading-5 text-transparent caret-foreground placeholder:text-muted-foreground not-placeholder-shown:placeholder:opacity-0 focus:outline-none'
        placeholder={placeholder}
        rows={1}
        spellCheck={false}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Sortable question item
 */
interface SortableQuestionItemProps {
  fieldId: string;
  index: number;
  isSelected: boolean;
  onRemove: (index: number) => void;
  onSelect: () => void;
  prompt: string;
  qType: QuestionType;
  title?: string;
}

function SortableQuestionItem({
  fieldId,
  index,
  isSelected,
  onRemove,
  onSelect,
  prompt,
  qType,
  title
}: SortableQuestionItemProps): JSX.Element {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: fieldId
  });

  const style = {
    opacity: isDragging ? 0.4 : 1,
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary/40 ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
      }`}
      style={style}
      role='button'
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      <div
        className='-ml-2 cursor-grab rounded p-1 text-muted-foreground opacity-50 transition-all hover:bg-muted hover:opacity-100 active:cursor-grabbing'
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className='h-4 w-4 shrink-0' />
      </div>

      <div className='min-w-0 flex-1 cursor-pointer'>
        <div className='flex items-center gap-2'>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            Q{index + 1}
          </span>
          <span className='truncate text-sm font-medium'>
            {title?.trim() || prompt?.replace(/<[^>]*>/g, '').trim() || (
              <span className='text-muted-foreground'>Untitled question</span>
            )}
          </span>
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground'>{QUESTION_TYPE_LABELS[qType]}</p>
      </div>

      <Button
        className='shrink-0 hover:text-destructive'
        type='button'
        size='icon'
        variant='ghost'
        onClick={e => {
          e.stopPropagation();
          onRemove(index);
        }}
      >
        <TrashIcon className='h-3.5 w-3.5' />
      </Button>
    </div>
  );
}

export function QuizQuestionsBuilder({
  initialQuestions,
  onDirtyChange,
  onPendingChange,
  quizId
}: QuizQuestionsBuilderProps): JSX.Element {
  const [state, dispatch, isPending] = useActionState(saveQuizQuestions, {
    success: false
  } as Awaited<ReturnType<typeof saveQuizQuestions>>);

  // State for delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; title: string } | null>(null);

  const mappedQuestions = initialQuestions.map(q => ({
    codeLanguage: q.codeLanguage ?? undefined,
    explanation: q.explanation ?? undefined,
    id: q.id,
    imageUrl: q.imageUrl ?? undefined,
    options: q.options.map(opt => ({
      content: opt.content,
      id: opt.id,
      isCorrect: opt.isCorrect,
      order: opt.order
    })),
    order: q.order,
    prompt: q.prompt,
    title: (q as { title?: string | null }).title ?? undefined,
    type: q.type
  }));

  const form = useForm<QuizFormValues>({
    defaultValues: {
      questions: mappedQuestions.length > 0 ? mappedQuestions : [],
      quizId
    },
    resolver: zodResolver(insertQuizQuestionsSchema)
  });

  const { append, fields, move, remove } = useFieldArray({
    control: form.control,
    name: 'questions'
  });
  const watchedQuestions = useWatch({
    control: form.control,
    name: 'questions'
  });

  const [selectedId, setSelectedId] = useState<string | null>(fields.length > 0 ? (fields[0]?.id ?? null) : null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [shouldSelectLastId, setShouldSelectLastId] = useState(false);

  useEffect(() => {
    if (shouldSelectLastId && fields.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedId(fields[fields.length - 1]?.id ?? null);
      setShouldSelectLastId(false);
    } else if ((!selectedId || !fields.find(f => f.id === selectedId)) && fields.length > 0) {
      setSelectedId(fields[0]?.id ?? null);
    } else if (fields.length === 0 && selectedId) {
      setSelectedId(null);
    }
  }, [fields, selectedId, shouldSelectLastId]);

  const activeIndex = fields.findIndex(f => f.id === selectedId);
  const selectedIndex = activeIndex !== -1 ? activeIndex : null;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Fix 1: Report dirty state to parent for unsaved-changes guard
  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  // Report pending state to parent for unified save button
  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    if (state.success) {
      showSuccessToast('Questions saved successfully');
      form.reset(form.getValues());
    } else if (state.error) {
      showErrorToast(state.error);
      // Fix 5: Map server-side validation errors to RHF field errors
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([key, messages]) => {
          if (messages) {
            form.setError(key as keyof QuizFormValues, {
              message: messages.join(', '),
              type: 'server'
            });
          }
        });
      }
    }
  }, [state, form]);

  const addQuestion = () => {
    append({
      explanation: '',
      options: [
        { content: '', isCorrect: true, order: 0 },
        { content: '', isCorrect: false, order: 1 }
      ],
      order: fields.length,
      prompt: '',
      title: '',
      type: QuestionType.SINGLE_CHOICE
    });
    setShouldSelectLastId(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id);
      const newIndex = fields.findIndex(f => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  // Fix 8: Confirm deletion of non-empty questions
  const handleRemoveQuestion = useCallback(
    (index: number) => {
      const question = form.getValues(`questions.${index}`);
      const hasContent =
        (question?.title?.trim() ?? '').length > 0 ||
        (question?.prompt?.replace(/<[^>]*>/g, '').trim() ?? '').length > 0 ||
        (question?.options?.some(o => o.content.trim().length > 0) ?? false);

      if (hasContent) {
        setDeleteTarget({ index, title: question?.title?.trim() || `Question ${index + 1}` });
      } else {
        remove(index);
      }
    },
    [form, remove]
  );

  const confirmDelete = useCallback(() => {
    if (deleteTarget !== null) {
      remove(deleteTarget.index);
      setDeleteTarget(null);
    }
  }, [deleteTarget, remove]);

  const onSubmit = (data: QuizFormValues) => {
    data.questions.forEach((q, qIdx) => {
      q.order = qIdx;
      if (q.options) {
        q.options.forEach((opt, optIdx) => {
          opt.order = optIdx;
        });
      }
    });

    startTransition(() => {
      dispatch(data);
    });
  };

  return (
    <>
      {/* Fix 8: Delete confirmation dialog */}
      <ConfirmationDialog
        confirmText='Delete'
        description={`Are you sure you want to delete "${deleteTarget?.title ?? 'this question'}"? This cannot be undone.`}
        open={deleteTarget !== null}
        title='Delete Question'
        variant='destructive'
        onConfirm={confirmDelete}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null);
        }}
      />
      <form id={QUESTIONS_FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-6 7xl-screen:grid-cols-5'>
          {/* Left panel: options + question list (column space: 2/5) */}
          <div className='space-y-4 7xl-screen:col-span-2'>
            {/* Options card — skeleton when no question selected */}
            {selectedIndex !== null && fields[selectedIndex] ? (
              <OptionsSection
                key={selectedId}
                control={form.control}
                index={selectedIndex}
                questionType={watchedQuestions?.[selectedIndex]?.type ?? QuestionType.SINGLE_CHOICE}
                register={form.register}
                setValue={form.setValue}
                onTypeChange={val => {
                  const newType = val as QuestionType;
                  form.setValue(`questions.${selectedIndex}.type`, newType);

                  // Fix 6: Enforce single-choice invariant
                  if (newType === QuestionType.SINGLE_CHOICE) {
                    const options = form.getValues(`questions.${selectedIndex}.options`) ?? [];
                    const correctIndices = options.map((o, i) => (o.isCorrect ? i : -1)).filter(i => i !== -1);
                    if (correctIndices.length !== 1) {
                      // Keep the first correct option (or mark the first option if none)
                      const keepIndex = correctIndices.length > 0 ? correctIndices[0] : 0;
                      options.forEach((_, i) => {
                        form.setValue(`questions.${selectedIndex}.options.${i}.isCorrect`, i === keepIndex, {
                          shouldDirty: true
                        });
                      });
                    }
                  }
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle icon={<ListChecksIcon />} iconColor='primary' iconVariant='glow'>
                    Options
                  </CardTitle>
                  <CardDescription>Select a question to configure its options.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {[1, 2, 3].map(i => (
                      <div key={i} className='flex animate-pulse items-center gap-3 rounded-lg border bg-muted/20 p-3'>
                        <div className='h-5 w-5 rounded-sm bg-muted/40' />
                        <div className='h-4 flex-1 rounded bg-muted/40' />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle icon={<HammerIcon />} iconColor='primary' iconVariant='glow'>
                  Questions Builder
                </CardTitle>
                <CardDescription>Add, reorder and manage your quiz questions.</CardDescription>
                <CardAction>
                  <Button type='button' variant='secondary' onClick={addQuestion}>
                    <PlusIcon className='h-4 w-4' />
                    Add Question
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className='space-y-4 pb-2'>
                {fields.length === 0 ? (
                  <div className='rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center'>
                    <div className='mx-auto w-fit rounded-full bg-primary/10 p-3'>
                      <ListIcon className='h-6 w-6 text-primary' />
                    </div>
                    <p className='mt-3 text-sm text-muted-foreground'>
                      No questions yet. Add your first question below.
                    </p>
                  </div>
                ) : (
                  <DndContext
                    collisionDetection={closestCorners}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                  >
                    <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                      <div className='space-y-2'>
                        {fields.map((field, index) => {
                          const question = watchedQuestions?.[index];
                          const qType = question?.type ?? QuestionType.SINGLE_CHOICE;
                          const prompt = question?.prompt ?? '';
                          const title = question?.title;
                          const isSelected = selectedId === field.id;

                          return (
                            <SortableQuestionItem
                              key={field.id}
                              fieldId={field.id}
                              index={index}
                              isSelected={isSelected}
                              prompt={prompt}
                              qType={qType}
                              {...(title !== undefined && { title })}
                              onRemove={() => handleRemoveQuestion(index)}
                              onSelect={() => setSelectedId(field.id)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeDragId ? (
                        <div className='flex w-full cursor-grabbing items-center gap-2 rounded-lg border bg-card p-3 opacity-90 shadow-2xl'>
                          <div className='rounded-full bg-primary/10 p-1'>
                            <span className='block h-4 w-4 rounded-full bg-primary' />
                          </div>
                          <span className='text-sm font-medium'>
                            {(() => {
                              const i = fields.findIndex(f => f.id === activeDragId);
                              const rawPrompt = watchedQuestions?.[i]?.prompt ?? '';
                              const plainPrompt = rawPrompt.replace(/<[^>]*>/g, '').trim();
                              return watchedQuestions?.[i]?.title?.trim() || plainPrompt || 'Untitled Question';
                            })()}
                          </span>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel: question editor (column space: 3/5) */}
          <div className='7xl-screen:col-span-3'>
            <div className='sticky top-6'>
              {selectedIndex !== null && fields[selectedIndex] ? (
                <QuestionEditor
                  key={selectedId}
                  control={form.control}
                  index={selectedIndex}
                  register={form.register}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle icon={<MousePointerClickIcon />} iconColor='primary' iconVariant='glow'>
                      No Question Selected
                    </CardTitle>
                    <CardDescription>Select a question to start editing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex h-[400px] w-full flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 text-center text-muted-foreground'>
                      <ListIcon className='mb-3 h-8 w-8 opacity-40' />
                      <p className='text-sm'>Select a question from the list</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

/**
 * Question editor panel
 */
interface QuestionEditorProps {
  control: Control<QuizFormValues>;
  index: number;
  register: UseFormRegister<QuizFormValues>;
}

function QuestionEditor({ control, index, register }: QuestionEditorProps): JSX.Element {
  return (
    <div className='space-y-4'>
      {/* Card 1: question metadata */}
      <Card>
        <CardHeader>
          <CardTitle icon={<Edit3Icon />} iconColor='primary' iconVariant='glow'>
            Question {index + 1}
          </CardTitle>
          <CardDescription>Edit the prompt, type and answer options.</CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Question title */}
          <Field>
            <FieldLabel htmlFor={`title-${index}`}>Question Title</FieldLabel>
            <Input {...register(`questions.${index}.title`)} id={`title-${index}`} placeholder='Question title' />
          </Field>

          {/* Question prompt */}
          <Field>
            <FieldLabel>Question Prompt</FieldLabel>
            <Controller
              name={`questions.${index}.prompt`}
              render={({ field }) => (
                <QuizMarkdownEditor
                  placeholder='Write your question here...'
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
              control={control}
            />
          </Field>

          {/* Question explanation */}
          <Field>
            <FieldLabel>Question Explanation</FieldLabel>
            <Controller
              name={`questions.${index}.explanation`}
              render={({ field }) => (
                <QuizMarkdownEditor
                  placeholder='Explain the correct answer...'
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
              control={control}
            />
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Question section (wrapper to include header button)
 */
interface OptionsSectionProps {
  control: Control<QuizFormValues>;
  index: number;
  onTypeChange: (val: string) => void;
  questionType: QuestionType;
  register: UseFormRegister<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
}

function OptionsSection({
  control,
  index,
  onTypeChange,
  questionType,
  register,
  setValue
}: OptionsSectionProps): JSX.Element {
  const { append, fields, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`
  });

  // Fix 2: Derive format/language from the form's persisted codeLanguage
  // (no local useState — survives question switches)
  const storedCodeLanguage = useWatch({ control, name: `questions.${index}.codeLanguage` });
  const optionFormat: 'text' | 'code' = storedCodeLanguage ? 'code' : 'text';
  const optionLanguage = storedCodeLanguage || 'javascript';

  const isCustomInput = questionType === QuestionType.CUSTOM_INPUT;

  const handleAddOption = () => {
    append({
      content: '',
      isCorrect: isCustomInput,
      order: fields.length
    });
  };

  const description = isCustomInput
    ? 'List accepted string answers (case-insensitive).'
    : questionType === QuestionType.SINGLE_CHOICE
      ? 'Check the box to mark the one correct answer.'
      : 'Check the boxes to mark all correct answers.';

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={<ListChecksIcon />} iconColor='primary' iconVariant='glow'>
          Options
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button type='button' variant='secondary' onClick={handleAddOption}>
            <PlusIcon />
            {isCustomInput ? 'Add Accepted Answer' : 'Add Option'}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Question type | Answer format | Language — single inline row */}
        <div className='flex items-stretch'>
          <div className='flex flex-none flex-col gap-3 pr-4'>
            <FieldLabel>Question Type</FieldLabel>
            <div className='w-42 max-w-42'>
              <Select value={questionType} onValueChange={onTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                  <SelectItem value={QuestionType.CUSTOM_INPUT}>Custom Input</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator orientation='vertical' />

          <div className='flex flex-none flex-col gap-3 px-4'>
            <FieldLabel>Answer Format</FieldLabel>
            <Tabs
              options={FORMAT_OPTIONS}
              value={optionFormat}
              onValueChange={val => {
                // Clear codeLanguage when switching back to text
                if (val === 'text') {
                  setValue(`questions.${index}.codeLanguage`, undefined, { shouldDirty: true });
                } else {
                  // Set default language when switching to code
                  setValue(`questions.${index}.codeLanguage`, optionLanguage, {
                    shouldDirty: true
                  });
                }
              }}
            />
          </div>

          <AnimatePresence>
            {optionFormat === 'code' && (
              <motion.div
                className='flex items-stretch overflow-hidden'
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                initial={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <Separator orientation='vertical' />
                <div className='flex flex-none flex-col gap-3 pl-4'>
                  <FieldLabel>Programming Language</FieldLabel>
                  <LanguagePicker
                    value={optionLanguage}
                    onChange={lang => {
                      setValue(`questions.${index}.codeLanguage`, lang, { shouldDirty: true });
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <OptionsBuilder
          control={control}
          fields={fields}
          optionFormat={optionFormat}
          optionLanguage={optionLanguage}
          questionIndex={index}
          questionType={questionType}
          register={register}
          remove={remove}
          setValue={setValue}
        />
      </CardContent>
    </Card>
  );
}

/**
 * Options builder
 */
interface OptionsBuilderProps {
  control: Control<QuizFormValues>;
  fields: FieldArrayWithId<QuizFormValues, `questions.${number}.options`, 'id'>[];
  optionFormat: 'text' | 'code';
  optionLanguage: string;
  questionIndex: number;
  questionType: QuestionType;
  register: UseFormRegister<QuizFormValues>;
  remove: (index: number) => void;
  setValue: UseFormSetValue<QuizFormValues>;
}

function OptionsBuilder({
  control,
  fields,
  optionFormat,
  optionLanguage,
  questionIndex,
  questionType,
  register,
  remove,
  setValue
}: OptionsBuilderProps): JSX.Element {
  const optionValues = useWatch({
    control,
    name: `questions.${questionIndex}.options`
  });

  const isCode = optionFormat === 'code';

  if (questionType === QuestionType.CUSTOM_INPUT) {
    return (
      <div className='space-y-3'>
        {fields.map((field, optIndex) => (
          <div key={field.id} className='flex items-center gap-3'>
            {isCode && (
              <BadgeCircular hashKey={optionLanguage}>
                <Code2Icon />
              </BadgeCircular>
            )}
            {isCode ? (
              <Controller
                name={`questions.${questionIndex}.options.${optIndex}.content`}
                render={({ field }) => (
                  <CodeOptionInput
                    language={optionLanguage}
                    placeholder={`Code Snippet ${optIndex + 1}`}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
                control={control}
              />
            ) : (
              <Input
                {...register(`questions.${questionIndex}.options.${optIndex}.content`)}
                className='flex-1'
                placeholder={`Accepted answer ${optIndex + 1}`}
              />
            )}
            <Button
              className='hover:text-destructive'
              type='button'
              size='icon'
              variant='ghost'
              onClick={() => remove(optIndex)}
            >
              <TrashIcon className='h-4 w-4' />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  // Single choice and multiple choice
  return (
    <div className='space-y-3'>
      {fields.map((field, optIndex) => {
        const isCorrect = optionValues?.[optIndex]?.isCorrect ?? false;

        return (
          <div
            key={field.id}
            className='flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:border-primary/30'
          >
            <Checkbox
              checked={isCorrect}
              color='primary'
              radius='sm'
              size='lg'
              onCheckedChange={(checked: boolean) => {
                if (questionType === QuestionType.SINGLE_CHOICE) {
                  fields.forEach((_, i) => {
                    setValue(`questions.${questionIndex}.options.${i}.isCorrect`, i === optIndex ? checked : false, {
                      shouldDirty: true
                    });
                  });
                } else {
                  setValue(`questions.${questionIndex}.options.${optIndex}.isCorrect`, checked, {
                    shouldDirty: true
                  });
                }
              }}
            >
              <span className='sr-only'>Correct answer</span>
            </Checkbox>
            {isCode && (
              <BadgeCircular hashKey={optionLanguage}>
                <Code2Icon />
              </BadgeCircular>
            )}
            {isCode ? (
              <Controller
                name={`questions.${questionIndex}.options.${optIndex}.content`}
                render={({ field }) => (
                  <CodeOptionInput
                    language={optionLanguage}
                    placeholder={`Code Snippet ${optIndex + 1}`}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
                control={control}
              />
            ) : (
              <Input
                {...register(`questions.${questionIndex}.options.${optIndex}.content`)}
                className='flex-1'
                placeholder={`Option ${optIndex + 1}`}
              />
            )}
            <Button
              className='hover:text-destructive'
              type='button'
              size='icon'
              variant='ghost'
              onClick={() => remove(optIndex)}
            >
              <TrashIcon className='h-4 w-4' />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
