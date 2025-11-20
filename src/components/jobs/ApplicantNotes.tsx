import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAddNote } from '@/hooks/useApplicantNotes';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface ApplicantNotesProps {
  applicationId: string;
  notes: any[];
}

const ApplicantNotes = ({ applicationId, notes }: ApplicantNotesProps) => {
  const [newNote, setNewNote] = useState('');
  const addNote = useAddNote();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await addNote.mutateAsync({
      applicationId,
      note: newNote,
    });

    setNewNote('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">Internal Notes</h3>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add a note about this applicant..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
        />
        <Button
          onClick={handleAddNote}
          disabled={!newNote.trim() || addNote.isPending}
          size="sm"
        >
          Add Note
        </Button>
      </div>

      <ScrollArea className="h-[300px] border rounded-lg p-4">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No notes yet. Add your first note above.
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-sm">
                    {note.author?.full_name || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ApplicantNotes;
