import knex from 'knex';
import {
  wrapError,
  UniqueViolationError,
  NotNullViolationError,
} from 'db-errors';
import databaseConfig from '../config';

const tableName = 'nodes';
const db = knex(databaseConfig);

const errorHandler = (e, res) => {
  const err = (wrapError(e));

  if (err instanceof UniqueViolationError) {
    console.error(`Columns: ${err.columns}, must be unique`);
    return res.status(400).json({ error: `Fields: ${err.columns}, must be unique` });
  } else if (err instanceof NotNullViolationError) {
    console.error(`Not null constraint failed for table ${err.table} and column ${err.column}`);
    return res.status(400).json({ error: `Field: ${err.column}, must be not null`});
  } else {
    console.error(`DB error: ${e}`);
    return res.status(500).json({ error: 'Internal server error'});
  }
};

const getNodesByParentId = (req, res) => {
  const parentId = +req.query.parentId || null;
  db(tableName).where({ parent_id: parentId }).select([
    'id', 'ip', 'name', 'port', 'parent_id',
  ])
    .then((items) => {
        res.json({ nodes: items });
    })
    .catch((e) => errorHandler(e, res));
};

const addNode = (req, res) => {
  const {
    ip, port, name, parentId,
  } = req.body;
  db(tableName).insert({
    ip, port, name, parent_id: +parentId || null,
  })
    .returning(['id', 'ip', 'name', 'port', 'parent_id'])
    .then((item) => {
      res.json({ node: item[0] });
    })
    .catch((e) => errorHandler(e, res));
};

const updateNode = (req, res) => {
  const {
    id, port, name, ip,
  } = req.body;
  db(tableName).where({ id }).update({
    port, name, ip,
  })
    .returning(['id', 'ip', 'name', 'port', 'parent_id'])
    .then((item) => {
      res.json({ node: item[0] });
    })
    .catch((e) => errorHandler(e, res));
};

const deleteNode = (req, res) => {
  const { id } = req.body;
  db(tableName).where({ id }).del()
    .then(() => {
      res.json({ id });
    })
    .catch((e) => errorHandler(e, res));
};

export {
  getNodesByParentId,
  addNode,
  updateNode,
  deleteNode,
};
