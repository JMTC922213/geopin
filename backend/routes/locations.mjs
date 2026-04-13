import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.mjs';

const router = express.Router();

// Get all locations
router.get('/locations', async (req, res) => {
  try {
    const database = getDatabase();
    const collection = database.collection('Location');

    // Optional filters: owner (email) or category
    const query = {};
    if (req.query.owner) {
      query.ownerEmail = req.query.owner;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const locations = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send({ success: true, locations: locations });
  } catch (err) {
    console.error(`Error fetching locations: ${err}`);
    res.status(500).send({ success: false, message: 'System error' });
  }
});

// Add a new location
router.post('/locations', async (req, res) => {
  const { name, latitude, longitude, category, description, userId } = req.body;
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (!name || Number.isNaN(lat) || Number.isNaN(lng)) {
    res.status(400).send({ success: false, message: 'Name, latitude, and longitude are required' });
    return;
  }

  try {
    const database = getDatabase();
    const collection = database.collection('Location');

    const newLocation = {
      name: name.trim(),
      latitude: lat,
      longitude: lng,
      category: category || 'general',
      description: description || '',
      ownerEmail: userId || null,
      createdAt: new Date()
    };

    const result = await collection.insertOne(newLocation);

    if (result.insertedId) {
      res.status(201).send({ success: true, locationId: result.insertedId, location: { ...newLocation, _id: result.insertedId } });
    } else {
      res.status(500).send({ success: false, message: 'Failed to add location' });
    }
  } catch (err) {
    console.error(`Error adding location: ${err}`);
    res.status(500).send({ success: false, message: 'System error' });
  }
});

// Update a location
router.put('/locations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, category, description } = req.body;

  const updates = {};
  if (name) updates.name = name.trim();
  if (latitude !== undefined) updates.latitude = parseFloat(latitude);
  if (longitude !== undefined) updates.longitude = parseFloat(longitude);
  if (category) updates.category = category;
  if (description !== undefined) updates.description = description;

  if (Object.keys(updates).length === 0) {
    res.status(400).send({ success: false, message: 'No fields to update' });
    return;
  }

  try {
    const database = getDatabase();
    const collection = database.collection('Location');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount > 0) {
      res.status(200).send({ success: true, message: 'Location updated' });
    } else {
      res.status(404).send({ success: false, message: 'Location not found' });
    }
  } catch (err) {
    console.error(`Error updating location: ${err}`);
    res.status(500).send({ success: false, message: 'System error' });
  }
});

// Delete a location
router.delete('/locations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const database = getDatabase();
    const collection = database.collection('Location');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res.status(200).send({ success: true, message: 'Location deleted' });
    } else {
      res.status(404).send({ success: false, message: 'Location not found' });
    }
  } catch (err) {
    console.error(`Error deleting location: ${err}`);
    res.status(500).send({ success: false, message: 'System error' });
  }
});

export default router;
