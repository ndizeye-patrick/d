const { ipcRenderer } = require('electron');

function App() {
    const [notes, setNotes] = React.useState([]);

    React.useEffect(() => {
        loadNotes();
    }, []);

    React.useEffect(() => {
        saveNotes();
    }, [notes]);

    const loadNotes = async () => {
        const loadedNotes = await ipcRenderer.invoke('load-notes');
        setNotes(loadedNotes);
    };

    const saveNotes = () => {
        ipcRenderer.send('save-notes', notes);
    };

    const addNote = () => {
        const newNote = {
            id: Date.now(),
            content: '',
            position: { x: 50, y: 50 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setNotes([...notes, newNote]);
    };

    const updateNote = (id, content) => {
        setNotes(notes.map(note =>
            note.id === id
                ? { ...note, content, updatedAt: new Date().toISOString() }
                : note
        ));
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    const moveNote = (id, position) => {
        setNotes(notes.map(note =>
            note.id === id
                ? { ...note, position, updatedAt: new Date().toISOString() }
                : note
        ));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-4">Mac Sticky Notes</h1>
            <button
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={addNote}
            >
                Add Note
            </button>
            {notes.map(note => (
                <StickyNote
                    key={note.id}
                    note={note}
                    updateNote={updateNote}
                    deleteNote={deleteNote}
                    moveNote={moveNote}
                />
            ))}
        </div>
    );
}

function StickyNote({ note, updateNote, deleteNote, moveNote }) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - note.position.x,
            y: e.clientY - note.position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            moveNote(note.id, {
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const formatDate = (dateString) => {
        return dateFns.format(new Date(dateString), 'MMM d, yyyy HH:mm');
    };

    return (
        <div
            className="absolute bg-yellow-200 p-4 rounded shadow-lg w-64"
            style={{ left: note.position.x, top: note.position.y }}
        >
            <div
                className="cursor-move mb-2 h-6 bg-yellow-300"
                onMouseDown={handleMouseDown}
            ></div>
            <textarea
                className="w-full h-32 p-2 bg-transparent resize-none focus:outline-none"
                value={note.content}
                onChange={(e) => updateNote(note.id, e.target.value)}
                placeholder="Type your note here..."
            />
            <div className="text-xs text-gray-500 mt-2">
                <div>Created: {formatDate(note.createdAt)}</div>
                <div>Updated: {formatDate(note.updatedAt)}</div>
            </div>
            <button
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                onClick={() => deleteNote(note.id)}
            >
                Delete
            </button>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));

