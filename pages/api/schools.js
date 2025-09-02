import connectDB, { closePool } from '../../lib/db';


function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}


function corsMiddleware(req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}

export default async function handler(req, res) {
 
  await runMiddleware(req, res, corsMiddleware);

  let db;
  try {
    db = await connectDB();

    if (req.method === 'GET') {
      try {
        const [rows] = await db.execute('SELECT * FROM schools ORDER BY id DESC');
        res.status(200).json(rows);
      } catch (error) {
        console.error('GET Error:', error);
        res.status(500).json({ error: 'Failed to fetch schools' });
      }
    } 
    else if (req.method === 'POST') {
      try {
        const { name, address, city, state, contact_number, image, email } = req.body;

      
        if (!name || !city || !state) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await db.execute(
          'INSERT INTO schools (name, address, city, state, contact_number, image, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, address, city, state, contact_number, image, email]
        );

        res.status(201).json({ id: result.insertId, message: 'School added successfully' });
      } catch (error) {
        console.error('POST Error:', error);
        res.status(500).json({ error: 'Failed to add school' });
      }
    } 
    else if (req.method === 'PUT') {
      try {
        const { id, name, address, city, state, contact_number, image, email } = req.body;

    
        if (!id || !name || !city || !state) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        if (image) {
          await db.execute(
            'UPDATE schools SET name=?, address=?, city=?, state=?, contact_number=?, image=?, email=? WHERE id=?',
            [name, address, city, state, contact_number, image, email, id]
          );
        } else {
          await db.execute(
            'UPDATE schools SET name=?, address=?, city=?, state=?, contact_number=?, email=? WHERE id=?',
            [name, address, city, state, contact_number, email, id]
          );
        }

        res.status(200).json({ message: 'School updated successfully' });
      } catch (error) {
        console.error('PUT Error:', error);
        res.status(500).json({ error: 'Failed to update school' });
      }
    } 
    else if (req.method === 'DELETE') {
      try {
        let id;

        if (req.query.id) {
          id = req.query.id;
        } else if (req.body.id) {
          id = req.body.id;
        } else {
          return res.status(400).json({ error: 'School ID is required' });
        }

        await db.execute('DELETE FROM schools WHERE id=?', [id]);
        res.status(200).json({ message: 'School deleted successfully' });
      } catch (error) {
        console.error('DELETE Error:', error);
        res.status(500).json({ error: 'Failed to delete school' });
      }
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },

};
