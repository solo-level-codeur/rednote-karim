const { 
  createTag, 
  getAllTags, 
  getTagById, 
  updateTag, 
  deleteTag,
  addTagToNote,
  removeTagFromNote,
  getNoteTags,
  getNotesByTag 
} = require('../models/tagModel');

// Créer un nouveau tag
const createTagController = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Le nom du tag est requis' });
  }

  try {
    const tagId = await createTag(name.trim());
    res.status(201).json({
      id: tagId,
      name: name.trim(),
      message: 'Tag créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du tag :', error);
    if (error.code === 'ER_DUP_ENTRY' || error.message === 'Un tag avec ce nom existe déjà') {
      res.status(409).json({ message: 'Un tag avec ce nom existe déjà' });
    } else {
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  }
};

// Obtenir tous les tags
const getAllTagsController = async (_, res) => {
  try {
    const tags = await getAllTags();
    // Normaliser la réponse: tag_id -> id, tag_name -> name
    const normalizedTags = tags.map(tag => ({
      id: tag.tag_id,
      name: tag.tag_name
    }));
    res.json(normalizedTags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir un tag par ID
const getTagByIdController = async (req, res) => {
  const { id } = req.params;

  // Validation de l'ID
  if (!id || id === 'undefined' || isNaN(id)) {
    return res.status(400).json({ message: 'ID du tag invalide' });
  }

  try {
    const tag = await getTagById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag non trouvé' });
    }
    // Normaliser la réponse: tag_id -> id, tag_name -> name
    const normalizedTag = {
      id: tag.tag_id,
      name: tag.tag_name
    };
    res.json(normalizedTag);
  } catch (error) {
    console.error('Erreur lors de la récupération du tag :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Mettre à jour un tag
const updateTagController = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Validation de l'ID
  if (!id || id === 'undefined' || isNaN(id)) {
    return res.status(400).json({ message: 'ID du tag invalide' });
  }

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Le nom du tag est requis' });
  }

  try {
    const success = await updateTag(id, name.trim());
    if (!success) {
      return res.status(404).json({ message: 'Tag non trouvé' });
    }
    res.json({ id, name: name.trim(), message: 'Tag mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tag :', error);
    if (error.message === 'Un tag avec ce nom existe déjà') {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  }
};

// Supprimer un tag
const deleteTagController = async (req, res) => {
  const { id } = req.params;

  // Validation de l'ID
  if (!id || id === 'undefined' || isNaN(id)) {
    return res.status(400).json({ message: 'ID du tag invalide' });
  }

  try {
    const success = await deleteTag(id);
    if (!success) {
      console.log(`❌ Tag ${id} non trouvé pour suppression`);
      return res.status(404).json({ message: 'Tag non trouvé' });
    }
    console.log(`✅ Tag ${id} supprimé avec succès`);
    res.json({ message: 'Tag supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du tag :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Ajouter un tag à une note
const addTagToNoteController = async (req, res) => {
  const { noteId, tagId } = req.params;

  try {
    await addTagToNote(noteId, tagId);
    res.json({ message: 'Tag ajouté à la note avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du tag à la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Supprimer un tag d'une note
const removeTagFromNoteController = async (req, res) => {
  const { noteId, tagId } = req.params;

  try {
    const success = await removeTagFromNote(noteId, tagId);
    if (!success) {
      return res.status(404).json({ message: 'Association tag-note non trouvée' });
    }
    res.json({ message: 'Tag supprimé de la note avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du tag de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir les tags d'une note
const getNoteTagsController = async (req, res) => {
  const { noteId } = req.params;

  try {
    const tags = await getNoteTags(noteId);
    res.json(tags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir les notes avec un tag spécifique
const getNotesByTagController = async (req, res) => {
  const { tagId } = req.params;
  const userId = req.user.id;

  try {
    const notes = await getNotesByTag(tagId, userId);
    res.json({
      tagId,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes par tag :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = {
  createTagController,
  getAllTagsController,
  getTagByIdController,
  updateTagController,
  deleteTagController,
  addTagToNoteController,
  removeTagFromNoteController,
  getNoteTagsController,
  getNotesByTagController
};