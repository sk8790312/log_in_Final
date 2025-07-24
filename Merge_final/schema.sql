CREATE TABLE IF NOT EXISTS topologies (
    id TEXT PRIMARY KEY,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS nodes (
    id TEXT,
    topology_id TEXT,
    label TEXT,
    level INTEGER,
    value INTEGER,
    mastered INTEGER DEFAULT 0,
    PRIMARY KEY (topology_id, id),
    FOREIGN KEY (topology_id) REFERENCES topologies (id)
);

CREATE TABLE IF NOT EXISTS edges (
    topology_id TEXT,
    from_node TEXT,
    to_node TEXT,
    label TEXT,
    PRIMARY KEY (topology_id, from_node, to_node),
    FOREIGN KEY (topology_id) REFERENCES topologies (id),
    FOREIGN KEY (from_node) REFERENCES nodes (topology_id, id),
    FOREIGN KEY (to_node) REFERENCES nodes (topology_id, id)
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    topology_id TEXT,
    node_id TEXT,
    question TEXT,
    answer TEXT,
    feedback TEXT,
    created_at TEXT,
    answered_at TEXT,
    FOREIGN KEY (topology_id, node_id) REFERENCES nodes (topology_id, id)
);