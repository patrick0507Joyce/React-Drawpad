let notes = [];
let imageNotes = [];

const updateNotes = (updatedNotes) => {
    if (updatedNotes) {
        notes = updatedNotes;
    }
}

const getNotes = () => {
    return notes;
}

const updateImageNotes = (updatedImageNotes) => {
    if (updatedImageNotes) {
        imageNotes = updatedImageNotes;
    }
}

const getImageNotes = () => {
    return imageNotes;
}

module.exports = { updateNotes, getNotes, updateImageNotes, getImageNotes };