import { useState } from 'react';
import { Bug, Lane } from './BugsPage';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AlertCircle, User, Calendar, FileText } from 'lucide-react';
import { BugDetailModal } from './BugDetailModal';

interface BugKanbanProps {
  bugs: Bug[];
  lanes: Lane[];
  onUpdateStatus: (bugId: number, newStatus: string) => void;
}

export function BugKanban({ bugs, lanes, onUpdateStatus }: BugKanbanProps) {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-4 p-6 h-full overflow-x-auto">
          {lanes.map((lane) => (
            <KanbanLane
              key={lane.id}
              lane={lane}
              bugs={bugs.filter((bug) => bug.status === lane.id)}
              onDrop={(bugId) => onUpdateStatus(bugId, lane.id)}
              onCardClick={(bug) => setSelectedBug(bug)}
            />
          ))}
        </div>
      </DndProvider>

      {selectedBug && (
        <BugDetailModal
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
        />
      )}
    </>
  );
}

interface KanbanLaneProps {
  lane: Lane;
  bugs: Bug[];
  onDrop: (bugId: number) => void;
  onCardClick: (bug: Bug) => void;
}

function KanbanLane({ lane, bugs, onDrop, onCardClick }: KanbanLaneProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'BUG_CARD',
    drop: (item: { bugId: number }) => onDrop(item.bugId),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4 transition-colors ${
        isOver ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: lane.color }}
          />
          <h3 className="font-medium">{lane.title}</h3>
        </div>
        <span className="px-2 py-1 bg-muted rounded text-xs">{bugs.length}</span>
      </div>

      <div className="space-y-3">
        {bugs.map((bug) => (
          <BugCard key={bug.id} bug={bug} onClick={() => onCardClick(bug)} />
        ))}
      </div>
    </div>
  );
}

interface BugCardProps {
  bug: Bug;
  onClick: () => void;
}

function BugCard({ bug, onClick }: BugCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'BUG_CARD',
    item: { bugId: bug.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      medium: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      low: 'bg-muted text-muted-foreground border-border',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-3 cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <AlertCircle className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <h4 className="text-sm font-medium line-clamp-2">{bug.title}</h4>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {bug.description}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(bug.severity)}`}>
          {bug.severity}
        </span>
        {bug.testCaseId && (
          <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs flex items-center gap-1">
            <FileText className="size-3" />
            TC-{bug.testCaseId}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="size-3" />
          <span>{bug.assignee || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span>{bug.createdAt.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
}
