let notes = [];

const updateNotes = (updatedNotes) => {
    if (updatedNotes) {
        notes = updatedNotes;
    }
}

const getNotes = () => {
    return notes;
}

module.exports = { updateNotes, getNotes };