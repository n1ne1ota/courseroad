import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { useInView } from '@/hooks/use-in-view';

const meta: Meta = {
  parameters: {
    layout: 'centered'
  },
  title: 'Hooks/useInView'
};

export default meta;

type Story = StoryObj;

const ScrollDemo = () => {
  const { inView, ref } = useInView<HTMLDivElement>({ once: false, threshold: 0.5 });

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        height: '300px',
        overflowY: 'auto',
        padding: '20px',
        width: '400px'
      }}
      tabIndex={0}
      aria-label='Scroll container'
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: '400px',
          justifyContent: 'flex-start'
        }}
      >
        <p style={{ marginBottom: '20px', textAlign: 'center' }}>Scroll down to see the box animate in.</p>
        <div
          style={{
            background: 'rgba(0, 84, 255, 0.1)',
            border: '1px dashed #0054ff',
            borderRadius: '8px',
            padding: '40px'
          }}
        >
          Keep scrolling...
        </div>
      </div>

      <div
        ref={ref}
        style={{
          alignItems: 'center',
          background: inView ? '#0054ff' : '#f3f4f6',
          borderRadius: '12px',
          color: inView ? 'white' : '#374151',
          display: 'flex',
          height: '200px',
          justifyContent: 'center',
          opacity: 1,
          transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.9)',
          transition: 'all 0.5s ease-out',
          width: '100%'
        }}
      >
        <h2>{inView ? 'In View! 🎉' : 'Out of View'}</h2>
      </div>

      <div style={{ height: '400px' }} />
    </div>
  );
};

export const Default: Story = {
  render: () => <ScrollDemo />
};
