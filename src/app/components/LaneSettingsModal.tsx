import { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Lane } from './BugsPage';

interface LaneSettingsModalProps {
  lanes: Lane[];
  onClose: () => void;
  onSave: (lanes: Lane[]) => void;
}

export function LaneSettingsModal({ lanes, onClose, onSave }: LaneSettingsModalProps) {
  const [editedLanes, setEditedLanes] = useState<Lane[]>(lanes);

  const handleAddLane = () => {
    const newLane: Lane = {
      id: `custom-${Date.now()}`,
      title: 'New Lane',
      color: '#6b7280',
    };
    setEditedLanes([...editedLanes, newLane]);
  };

  const handleRemoveLane = (id: string) => {
    setEditedLanes(editedLanes.filter((lane) => lane.id !== id));
  };

  const handleUpdateLane = (id: string, updates: Partial<Lane>) => {
    setEditedLanes(
      editedLanes.map((lane) =>
        lane.id === id ? { ...lane, ...updates } : lane
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedLanes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2>Configure Kanban Lanes</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="space-y-3">
            {editedLanes.map((lane, index) => (
              <div
                key={lane.id}
                className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-md"
              >
                <GripVertical className="size-5 text-muted-foreground cursor-move" />

                <div
                  className="w-8 h-8 rounded border border-border cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: lane.color }}
                >
                  <input
                    type="color"
                    value={lane.color}
                    onChange={(e) =>
                      handleUpdateLane(lane.id, { color: e.target.value })
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <input
                  type="text"
                  value={lane.title}
                  onChange={(e) =>
                    handleUpdateLane(lane.id, { title: e.target.value })
                  }
                  className="flex-1 px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Lane title"
                />

                <input
                  type="text"
                  value={lane.id}
                  onChange={(e) =>
                    handleUpdateLane(lane.id, { id: e.target.value })
                  }
                  className="w-40 px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  placeholder="lane-id"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveLane(lane.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddLane}
            className="flex items-center gap-2 px-4 py-2 mt-4 border border-dashed border-border rounded-md hover:bg-accent transition-colors w-full"
          >
            <Plus className="size-4" />
            Add Lane
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
