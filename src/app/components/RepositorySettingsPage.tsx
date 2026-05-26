import { useState, useRef } from 'react';
import { useParams } from 'react-router';
import { Settings, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface CustomField {
  id: string;
  name: string;
  description: string;
  type: 'dropdown' | 'text' | 'textarea';
  options?: string[];
}

interface DraggableFieldProps {
  field: CustomField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (field: CustomField) => void;
  onDelete: (id: string) => void;
}

const FIELD_TYPE = 'CUSTOM_FIELD';

function DraggableField({ field, index, moveField, onEdit, onDelete }: DraggableFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: FIELD_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: FIELD_TYPE,
    item: () => {
      return { id: field.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`bg-card border border-border rounded-lg p-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="cursor-move mt-1">
            <GripVertical className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{field.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {field.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(field)}
            className="px-3 py-1 text-sm border border-border rounded hover:bg-accent transition-colors"
          >
            編集
          </button>
          <button
            onClick={() => onDelete(field.id)}
            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">表示UI: </span>
          <span className="font-medium">
            {field.type === 'dropdown'
              ? 'プルダウン'
              : field.type === 'textarea'
              ? 'テキストエリア'
              : 'テキスト'}
          </span>
        </div>
        {field.options && field.options.length > 0 && (
          <div>
            <span className="text-muted-foreground">選択肢: </span>
            <span className="font-medium">
              {field.options.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function RepositorySettingsPage() {
  const { repoId } = useParams();
  const repoName = 'finance-portal'; // Mock

  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: '1',
      name: '分類',
      description: 'オンライン、バッチなどの項目を記載する',
      type: 'dropdown',
      options: ['オンライン', 'バッチ', 'API'],
    },
    {
      id: '2',
      name: '画面系/機能系',
      description: '画面に注目したケースか機能に注目したケースか区分を記載',
      type: 'dropdown',
      options: ['画面系', '機能系'],
    },
    {
      id: '3',
      name: 'テスト観点',
      description: 'テストの観点を記載',
      type: 'dropdown',
      options: ['オートサジェスト', 'テキスト', '書式', 'マスキング', '運用', 'ログ'],
    },
    {
      id: '4',
      name: '手順',
      description: 'ケースの手順を記載する',
      type: 'textarea',
    },
  ]);

  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: '',
      description: '',
      type: 'text',
    };
    setEditingField(newField);
    setShowAddForm(true);
  };

  const handleSaveField = () => {
    if (!editingField) return;

    if (showAddForm) {
      setCustomFields([...customFields, editingField]);
    } else {
      setCustomFields(
        customFields.map((field) =>
          field.id === editingField.id ? editingField : field
        )
      );
    }

    setEditingField(null);
    setShowAddForm(false);
  };

  const handleDeleteField = (id: string) => {
    setCustomFields(customFields.filter((field) => field.id !== id));
  };

  const handleUpdateEditingField = (updates: Partial<CustomField>) => {
    if (!editingField) return;
    setEditingField({ ...editingField, ...updates });
  };

  const handleAddOption = () => {
    if (!editingField) return;
    const newOptions = [...(editingField.options || []), ''];
    handleUpdateEditingField({ options: newOptions });
  };

  const handleUpdateOption = (index: number, value: string) => {
    if (!editingField) return;
    const newOptions = [...(editingField.options || [])];
    newOptions[index] = value;
    handleUpdateEditingField({ options: newOptions });
  };

  const handleDeleteOption = (index: number) => {
    if (!editingField) return;
    const newOptions = (editingField.options || []).filter((_, i) => i !== index);
    handleUpdateEditingField({ options: newOptions });
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    const dragField = customFields[dragIndex];
    const newFields = [...customFields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    setCustomFields(newFields);
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Repositories', path: '/repositories' },
            { label: repoName, path: `/repositories/${repoId}/projects` },
            { label: 'Settings' },
          ]}
        />
        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-6" />
              <h1>Repository Settings</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              テストケースのカスタムフォーマットを設定
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2>テストケース カスタムフィールド</h2>
            <button
              onClick={handleAddField}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" />
              フィールドを追加
            </button>
          </div>

          <div className="space-y-4">
            {customFields.map((field, index) => (
              <DraggableField
                key={field.id}
                field={field}
                index={index}
                moveField={moveField}
                onEdit={(field) => {
                  setEditingField(field);
                  setShowAddForm(false);
                }}
                onDelete={handleDeleteField}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border">
              <h2>{showAddForm ? 'フィールドを追加' : 'フィールドを編集'}</h2>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {/* Field Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  項目名 *
                </label>
                <input
                  type="text"
                  value={editingField.name}
                  onChange={(e) =>
                    handleUpdateEditingField({ name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例: 分類"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  説明（目的）*
                </label>
                <textarea
                  value={editingField.description}
                  onChange={(e) =>
                    handleUpdateEditingField({ description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  placeholder="例: オンライン、バッチなどの項目を記載する"
                />
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  表示するUI *
                </label>
                <select
                  value={editingField.type}
                  onChange={(e) =>
                    handleUpdateEditingField({
                      type: e.target.value as CustomField['type'],
                    })
                  }
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="text">テキスト</option>
                  <option value="textarea">テキストエリア</option>
                  <option value="dropdown">プルダウン</option>
                </select>
              </div>

              {/* Options (for dropdown) */}
              {editingField.type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    選択肢
                  </label>
                  <div className="space-y-2">
                    {(editingField.options || []).map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleUpdateOption(index, e.target.value)
                          }
                          className="flex-1 px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder={`選択肢 ${index + 1}`}
                        />
                        <button
                          onClick={() => handleDeleteOption(index)}
                          className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddOption}
                      className="text-sm text-primary hover:underline"
                    >
                      + 選択肢を追加
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => {
                  setEditingField(null);
                  setShowAddForm(false);
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveField}
                disabled={!editingField.name || !editingField.description}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="size-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DndProvider>
  );
}
