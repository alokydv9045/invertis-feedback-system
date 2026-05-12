import { supabase } from '../db.js';

const TABLES = ['users', 'courses', 'faculty', 'enrollments', 'tlfqs', 'questions', 'responses', 'answers'];

export const exportData = async (req, res) => {
  try {
    const result = {};
    for (const table of TABLES) {
      const { data } = await supabase.from(table).select('*');
      result[table] = data || [];
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ message: 'Error exporting data', error: err.message });
  }
};

export const importData = async (req, res) => {
  try {
    const { data, mode } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid or missing sync data payload' });
    }

    if (mode === 'overwrite') {
      // Delete in reverse dependency order
      for (const table of [...TABLES].reverse()) {
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    for (const table of TABLES) {
      if (data[table] && Array.isArray(data[table])) {
        for (const item of data[table]) {
          if (mode === 'merge' && item.id) {
            await supabase.from(table).delete().eq('id', item.id);
          }
          await supabase.from(table).insert(item);
        }
      }
    }

    return res.status(200).json({ message: `Full system data synchronized successfully using mode: ${mode}` });
  } catch (err) {
    console.error('Import error:', err);
    return res.status(500).json({ message: 'Error importing and synchronizing data', error: err.message });
  }
};
