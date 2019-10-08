import knex from 'knex';
import databaseConfig from '../config';

const tableName = 'nodes';
const db = knex(databaseConfig);

const getNodesByParentId = (req, res) => {
  console.log(req.query.parentId);
  const parentId = req.query.parentId || null;
  db(tableName).where({ parent_id: parentId }).select('*')
    .then((items) => {
      if (items.length) {
        res.json({ nodes: items, dbError: false, dataExists: true });
      } else {
        res.json({ dataExists: false, dbError: false });
      }
    })
    .catch(() => res.status(400).json({ dbError: true }));
};

const postNode = (req, res) => {
  const {
    ip, port, name, parentId,
  } = req.body;

  db(tableName).insert({
    ip, port, name, parent_id: +parentId || null,
  })
    .returning('*')
    .then((item) => {
      res.json({ node: item[0], dbError: false });
    })
    .catch(() => res.status(400).json({ dbError: true }));
};

const putNode = (req, res) => {
  const {
    id, port, name, ip,
  } = req.body;
  db(tableName).where({ id }).update({
    port, name, ip,
  })
    .returning('*')
    .then((item) => {
      res.json({ node: item[0], dbError: false });
    })
    .catch(() => res.status(400).json({ dbError: true }));
};

const deleteNode = (req, res) => {
  const { id } = req.body;
  db(tableName).where({ id }).del()
    .then(() => {
      res.json({ id, dbError: false });
    })
    .catch(() => res.status(400).json({ dbError: true }));
};

export {
  getNodesByParentId,
  postNode,
  putNode,
  deleteNode,
};
