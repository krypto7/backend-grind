import Note from "../models/notes.model.js";

export const createNote = async (req,res)=>{
    const {title, content} = req.body;

    if(!title || !content) {
        return res.status(400).json({message: "Title and content are required"});
    }

    const note = await Note.create({
        title,
        content,
        owner: req.user.id
    })
    res.status(201).json({
        message: "Note created successfully",
        note
    });
}

export const editNote = async (req,res)=>{
    const {title, content,isCompleted} = req.body;
    const {id} = req.params;

    const updateData = {};

    if(title !== undefined)
    updateData.title = title;

if(content !== undefined)
    updateData.content = content;

if(isCompleted !== undefined)
    updateData.isCompleted = isCompleted;
    const note = await Note.findByIdAndUpdate({_id: id,owner: req.user.id},updateData,{new: true});
    if(!note){
        return res.status(404).json({
            message: "Note not found"
        })
    }
    res.status(200).json({
        message: "Note updated successfully",
        note
    })

}

export const deleteNote = async (req,res)=>{
    const {id} = req.params;

    const note = await Note.findByIdAndDelete({_id:id,owner: req.user.id});
    if(!note){
        return res.status(404).json({
            message: "Note not found"
        })
    }
    res.status(200).json({
        message: "Note deleted successfully"
    })

}

export const getAllNotes = async (req,res)=>{
    try {
        const notes = await Note.find({owner: req.user.id});
        if(!notes) {
            return res.status(404).json({message: "No notes found"});
        }
        res.status(200).json({message: "Notes fetched successfully", notes});
    } catch (error) {
        return res.status(500).json({message: "Error fetching notes", error: error.message || error});
    }
}   