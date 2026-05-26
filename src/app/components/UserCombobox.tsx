import { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Check } from 'lucide-react';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Mock users for assignee selection
const mockUsers: UserOption[] = [
  { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: 'admin' },
  { id: 2, name: '佐藤花子', email: 'sato@example.com', role: 'qa' },
  { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', role: 'developer' },
  { id: 4, name: '山田次郎', email: 'yamada@example.com', role: 'qa' },
  { id: 5, name: '中村美咲', email: 'nakamura@example.com', role: 'viewer' },
];

export function UserCombobox({ value, onChange, placeholder = 'Select assignee...' }: UserComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter users based on search query
  const filteredUsers = mockUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Get selected user
  const selectedUser = mockUsers.find((user) => user.name === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered users change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleInputClick = () => {
    setIsOpen(true);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelectUser = (user: UserOption) => {
    onChange(user.name);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredUsers.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredUsers[highlightedIndex]) {
          handleSelectUser(filteredUsers[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  const displayValue = isOpen ? searchQuery : (selectedUser?.name || '');

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={placeholder}
          autoComplete="off"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredUsers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              No users found
            </div>
          ) : (
            filteredUsers.map((user, index) => {
              const isSelected = user.name === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    isHighlighted ? 'bg-accent' : ''
                  } ${isSelected ? 'bg-primary/10' : ''}`}
                >
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                  {isSelected && <Check className="size-4 text-primary flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
