import { Button, Card, CardBody } from '@courseroad/iota-ui';

import { confirmAnnouncementUnsubscribe } from '../actions/unsubscribe-actions';

type View = { state: 'confirm'; token: string } | { state: 'done' } | { state: 'invalid' };

const COPY = {
  confirm: {
    body: 'You will stop getting email when a teacher or organization posts an announcement. You can still read them in Courseroad, and you can switch the emails back on from your announcements page.',
    title: 'Unsubscribe from announcement emails?'
  },
  done: {
    body: 'You will no longer get announcement emails. You can switch them back on from your announcements page in Courseroad.',
    title: 'You are unsubscribed'
  },
  invalid: {
    body: 'This unsubscribe link is not valid. Open the latest announcement email and use its link, or switch the emails off from your announcements page in Courseroad.',
    title: 'This link does not work'
  }
} as const;

/** The public page an announcement email links to. It asks first, so a mail scanner opening the link changes nothing. */
export function UnsubscribeView(props: View) {
  const copy = COPY[props.state];

  return (
    <div className='relative z-10 mx-auto flex w-full max-w-lg flex-1 items-center px-6 py-12 lg:px-8'>
      <Card className='w-full' shadow='xl' variant='frosted-glass'>
        <CardBody className='flex flex-col gap-4 p-8'>
          <h1 className='text-2xl font-medium tracking-tight'>{copy.title}</h1>
          <p className='text-muted-foreground'>{copy.body}</p>
          {props.state === 'confirm' ? (
            <form action={confirmAnnouncementUnsubscribe}>
              <input name='token' type='hidden' value={props.token} />
              <Button type='submit'>Unsubscribe</Button>
            </form>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
