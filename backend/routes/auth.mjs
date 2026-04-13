import express from 'express';
import { getDatabase } from '../config/database.mjs';

const router = express.Router();

// Login endpoint
router.post('/auth', async (req, res) => {
  let email = req.body['email'];
  let password = req.body['password'];
  let return_message = 'fail';

  if (email === null || password === null || email === '' || password === '') {
    return_message = 'Email and password are required';
    res.status(200).send({ message: return_message });
    return;
  }
  console.log(req.body);

  try {
    const database = getDatabase();
    const collection = database.collection("User");
    const findOneQuery = { email: email };

    const findOneResult = await collection.findOne(findOneQuery);
    if (findOneResult === null) {
      console.log("Couldn't find user.\n");
      return_message = 'User does not exist';
    } else {
      console.log(`Found:\n${JSON.stringify(findOneResult)}\n`);
      if (findOneResult.password === password) {
        console.log("User found.\n");
        return_message = 'success';
      } else {
        console.log("Wrong password.\n");
        return_message = 'Incorrect password';
      }
    }
  } catch (err) {
    console.error(`Something went wrong trying to find one document: ${err}\n`);
    return_message = 'System error';
  }

  res.status(200).send({ message: return_message });
});

// Check account existence endpoint
router.post('/check-account', async (req, res) => {
  console.log(req.body);
  let email = req.body['email'];

  if (email === null) {
    res.status(200).send({
      status: 'System error',
      userExists: false,
    });
    return;
  }

  try {
    const database = getDatabase();
    const collection = database.collection("User");
    const findOneQuery = { email: email };

    const findOneResult = await collection.findOne(findOneQuery);

    if (findOneResult === null) {
      res.status(200).send({
        status: 'User not exists',
        userExists: false,
      });
    } else {
      res.status(200).send({
        status: 'User exists',
        userExists: true,
      });
    }
  } catch (err) {
    console.error(`Something went wrong trying to find one document: ${err}\n`);
    res.status(200).send({
      status: 'System error',
      userExists: false,
    });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  console.log(req.body);
  let email = req.body['email'];
  let password = req.body['password'];
  let nickname = req.body['nickname'];
  let return_message = 'Registration failed';

  // Input validation
  if (!email || !password || !nickname) {
    return_message = 'Email, password, and nickname are required';
    res.status(200).send({ return_message: return_message });
    return;
  }

  if (password.length < 6) {
    return_message = 'Password must be at least 6 characters long';
    res.status(200).send({ return_message: return_message });
    return;
  }

  if (nickname.length === 0 || nickname.length > 20) {
    return_message = 'Nickname must be non-empty and at most 20 characters';
    res.status(200).send({ return_message: return_message });
    return;
  }

  try {
    const database = getDatabase();
    const collection = database.collection("User");

    // Check if user already exists
    const existingUser = await collection.findOne({ email: email });

    if (existingUser) {
      return_message = 'account is already created';
    } else {
      // Insert new user
      const newUser = {
        email: email,
        password: password,
        nickname: nickname,
        createdAt: new Date()
      };
      const insertResult = await collection.insertOne(newUser);

      if (insertResult.insertedId) {
        return_message = 'Registration successful';
        console.log(`New user registered: ${email} with nickname: ${nickname} (ID: ${insertResult.insertedId})`);
      } else {
        return_message = 'Registration failed';
      }
    }
  } catch (err) {
    console.error(`Registration error: ${err}\n`);
    return_message = 'System error';
  }

  res.status(200).send({ return_message: return_message });
});

// Get user profile
router.get('/profile/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const database = getDatabase();
    const profileCollection = database.collection("Profile");

    const profile = await profileCollection.findOne({ email: email });

    if (profile) {
      res.status(200).json(profile);
    } else {
      // Return empty profile if not found
      res.status(200).json({
        email: email,
        username: '',
        age: 0,
        bio: '',
        profileImage: '',
        phone: ''
      });
    }
  } catch (err) {
    console.error(`Error fetching profile: ${err}\n`);
    res.status(500).json({ error: 'System error' });
  }
});

// Update user profile
router.put('/profile/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const { username, age, bio, profileImage, phone } = req.body;

  try {
    const database = getDatabase();
    const profileCollection = database.collection("Profile");

    // Prepare profile data with different data types
    const profileData = {
      email: email,
      username: username || '',           // Text
      age: parseInt(age) || 0,            // Number
      bio: bio || '',                     // Text
      profileImage: profileImage || '',   // Text/URL
      phone: phone || '',                 // Text
      updatedAt: new Date()               // Date
    };

    // Upsert: update if exists, insert if not
    const result = await profileCollection.updateOne(
      { email: email },
      { $set: profileData },
      { upsert: true }
    );

    if (result.acknowledged) {
      console.log(`Profile updated for: ${email}`);
      res.status(200).json({
        message: 'Profile updated successfully',
        profile: profileData
      });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  } catch (err) {
    console.error(`Error updating profile: ${err}\n`);
    res.status(500).json({ error: 'System error' });
  }
});

export default router;
